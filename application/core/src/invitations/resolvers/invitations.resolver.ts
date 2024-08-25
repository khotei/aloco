import { UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver, Subscription } from "@nestjs/graphql"
import { InjectRepository } from "@nestjs/typeorm"
import { PubSub } from "graphql-subscriptions"
import type { Repository } from "typeorm"

import { InvitationResponse } from "@/invitations/dto/invitation-response.dto"
import { SendInvitationInput } from "@/invitations/dto/send-invitation-input.dto"
import { Invitation } from "@/invitations/entities/invitation.entity"
import {
  Auth,
  type AuthPayload,
} from "@/passport/authentication/decorators/auth.decorator"
import { JwtAuthGuard } from "@/passport/authentication/guards/jwt-auth.guard"
import { User } from "@/users/entities/user.entity"

@Resolver()
export class InvitationsResolver {
  pubSub = new PubSub()

  constructor(
    @InjectRepository(Invitation)
    private readonly invitationsRepo: Repository<Invitation>,
    @InjectRepository(User)
    private usersRepo: Repository<User>
  ) {}
  @UseGuards(JwtAuthGuard)
  @Subscription(() => InvitationResponse, {
    filter(invitationRes: InvitationResponse, _: any, context: any) {
      console.log("filter", invitationRes)
      return [
        invitationRes.invitation.receiver.id,
        invitationRes.invitation.sender.id,
      ].includes(context.req.user.userId)
    },
    name: "invitationSent",
  })
  async emitInvitation() {
    console.log(
      "emit",
      await this.pubSub.asyncIterator("invitationSent").next()
    )
    return this.pubSub.asyncIterator("invitationSent")
  }

  @UseGuards(JwtAuthGuard)
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
       * @todo: move to interceptor
       */
      await this.pubSub.publish("invitation", { invitation })
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
       * @todo: move to interceptor
       */
      await this.pubSub.publish("invitationSent", { invitation })
      console.log("published", { invitation })
      return { invitation }
    }
  }
}
