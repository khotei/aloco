import { UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { InjectRepository } from "@nestjs/typeorm"
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
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationsRepo: Repository<Invitation>,
    @InjectRepository(User)
    private usersRepo: Repository<User>
  ) {}
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
