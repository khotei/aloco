import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { Invitation } from "@/invitations/entities/invitation.entity"
import { InvitationsResolver } from "@/invitations/resolvers/invitations.resolver"
import { User } from "@/users/entities/user.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, User])],
  providers: [InvitationsResolver],
})
export class InvitationsModule {}
