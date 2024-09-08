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
} from "@/authentication/decorators/auth.decorator"
import { JwtAuthGuard } from "@/authentication/guards/jwt-auth.guard"
import { InvitationResponse } from "@/dto/invitations/invitation-response.dto"
import { SendInvitationInput } from "@/dto/invitations/send-invitation-input.dto"
import { Invitation, invitationStatus } from "@/entities/invitation.entity"
import { User } from "@/entities/user.entity"
import {
  buildInvitationEvent,
  INVITATION_SENT_EVENT_KEY,
  type InvitationSentEvent,
  InvitationSentInterceptor,
} from "@/interceptors/invitation-sent-interceptor"
import {
  INVITATION_TIMEOUT_QUEUE_KEY,
  InvitationTimeoutInterceptor,
} from "@/interceptors/invitation-timeout-interceptor"

@Processor(INVITATION_TIMEOUT_QUEUE_KEY)
@Resolver()
export class InvitationsResolver {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationsRepo: Repository<Invitation>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private readonly pubSub: PubSub
  ) {}
  @UseGuards(JwtAuthGuard)
  @Subscription(() => InvitationResponse, {
    filter(invitationRes: InvitationSentEvent, _: void, context: any) {
      return [
        invitationRes.invitationSent.invitation.receiver.id,
        invitationRes.invitationSent.invitation.sender.id,
      ].includes(context.req.auth.userId)
    },
    name: INVITATION_SENT_EVENT_KEY,
  })
  async emitInvitation() {
    return this.pubSub.asyncIterator<InvitationResponse>(
      INVITATION_SENT_EVENT_KEY
    )
  }

  @Process()
  async processInvitationTimeout(job: Job<InvitationResponse>) {
    const invitation = await this.invitationsRepo.findOneByOrFail({
      id: job.data.invitation.id,
    })
    if (invitation.status === invitationStatus.PENDING) {
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
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(InvitationSentInterceptor, InvitationTimeoutInterceptor)
  @Mutation(() => InvitationResponse, { name: "sendInvitation" })
  async save(
    @Auth() auth: AuthPayload,
    @Args("sendInvitationInput") input: SendInvitationInput
  ): Promise<InvitationResponse> {
    const user = await this.usersRepo.findOneByOrFail({ id: auth.userId })
    if (input.id) {
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
