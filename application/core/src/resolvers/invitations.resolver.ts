import { UseGuards, UseInterceptors } from "@nestjs/common"
import { Args, Mutation, Resolver, Subscription } from "@nestjs/graphql"
import { InjectRepository } from "@nestjs/typeorm"
import { PubSub } from "graphql-subscriptions"
import type { Repository } from "typeorm"

import {
  Auth,
  type AuthPayload,
} from "@/authentication/decorators/auth.decorator"
import { JwtAuthGuard } from "@/authentication/guards/jwt-auth.guard"
import { InvitationResponse } from "@/dto/invitations/invitation-response.dto"
import { SendInvitationInput } from "@/dto/invitations/send-invitation-input.dto"
import { Invitation } from "@/entities/invitation.entity"
import { User } from "@/entities/user.entity"
import { InvitationSentInterceptor } from "@/interceptors/invitation-sent-interceptor"

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
    /**
     * @todo: improve type-safe
     */
    filter(invitationRes: InvitationResponse, _: any, context: any) {
      return [
        invitationRes.invitation.receiver.id,
        invitationRes.invitation.sender.id,
      ].includes(context.req.user.userId)
    },
    name: "invitationSent",
    /**
     * @todo: why emitInvitation return null without resolver
     *
     * asyncIterator return wrong value
     * maybe it returns {value: {...}} instead {...}
     */
    resolve(value) {
      return value
    },
  })
  async emitInvitation() {
    return this.pubSub.asyncIterator<InvitationResponse>("invitationSent")
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(InvitationSentInterceptor)
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
      /**
       * @todo: schedule timeout
       */
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
      /**
       * @todo: schedule timeout
       */
      return { invitation }
    }
  }
}
