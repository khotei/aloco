import { Process, Processor } from "@nestjs/bull"
import { UseGuards, UseInterceptors } from "@nestjs/common"
import { Args, Mutation, Resolver, Subscription } from "@nestjs/graphql"
import { InjectRepository } from "@nestjs/typeorm"
import { Job } from "bull"
import { PubSub } from "graphql-subscriptions"
import type { Repository } from "typeorm"

import {
  Auth,
  type AuthPayload,
} from "@/api/authentication/decorators/auth.decorator"
import { JwtAuthGuard } from "@/api/authentication/guards/jwt-auth.guard"
import {
  type InvitationResponseUnion,
  invitationResponseUnion,
} from "@/api/dto/invitations/invitation-response-union.dto"
import { SendInvitationInput } from "@/api/dto/invitations/send-invitation-input.dto"
import {
  buildInvitationEvent,
  INVITATION_SENT_EVENT_KEY,
  INVITATION_TIMEOUT_QUEUE_KEY,
  type InvitationSentEventPayload,
  InvitationSentInterceptor,
} from "@/api/interceptors/invitation-sent-interceptor"
import {
  Invitation,
  invitationStatus,
} from "@/domain/entities/invitation.entity"
import { Room } from "@/domain/entities/room.entity"
import { User } from "@/domain/entities/user.entity"

@Processor(INVITATION_TIMEOUT_QUEUE_KEY)
@Resolver()
export class InvitationsResolver {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationsRepo: Repository<Invitation>,
    @InjectRepository(Room)
    private readonly roomsRepo: Repository<Room>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private readonly pubSub: PubSub
  ) {}
  @UseGuards(JwtAuthGuard)
  @Subscription(() => invitationResponseUnion, {
    filter(invitationRes: InvitationSentEventPayload, _: void, context: any) {
      return [
        invitationRes.invitationSent.invitation.receiver.id,
        invitationRes.invitationSent.invitation.sender.id,
      ].includes(context.req.auth.userId)
    },
    name: INVITATION_SENT_EVENT_KEY,
  })
  async emitInvitation() {
    return this.pubSub.asyncIterator<InvitationResponseUnion>(
      INVITATION_SENT_EVENT_KEY
    )
  }

  @Process()
  async processInvitationTimeout(job: Job<InvitationResponseUnion>) {
    const invitation = await this.invitationsRepo.findOneByOrFail({
      id: job.data.invitation.id,
    })
    await this.invitationsRepo.save(
      this.invitationsRepo.merge(invitation, {
        status: invitationStatus.TIMEOUT,
      })
    )
    await this.pubSub.publish(
      INVITATION_SENT_EVENT_KEY,
      buildInvitationEvent({ invitation })
    )
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(InvitationSentInterceptor)
  @Mutation(() => invitationResponseUnion, { name: "sendInvitation" })
  async save(
    @Auth() auth: AuthPayload,
    @Args("sendInvitationInput") input: SendInvitationInput
  ): Promise<InvitationResponseUnion> {
    const user = await this.usersRepo.findOneByOrFail({ id: auth.userId })
    if (input.id) {
      /**
       * @todo: allow to update invitation when it is only in pending state.
       */
      const invitation = await this.invitationsRepo.findOneOrFail({
        where: [
          {
            id: input.id,
            receiver: { id: user.id },
          },
          {
            id: input.id,
            sender: { id: user.id },
          },
        ],
      })
      await this.invitationsRepo.save(
        this.invitationsRepo.merge(invitation, input)
      )

      if (invitation.status === invitationStatus.ACCEPTED) {
        const room = await this.roomsRepo.save(this.roomsRepo.create())
        return { invitation, room }
      }
      return { invitation }
    } else {
      const receiver = await this.usersRepo.findOneByOrFail({
        id: input.receiverId,
      })
      const invitation = await this.invitationsRepo.save(
        this.invitationsRepo.create({
          receiver: receiver,
          sender: user,
          status: input.status,
        })
      )
      return { invitation }
    }
  }
}
