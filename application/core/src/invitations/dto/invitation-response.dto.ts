import { Field, ObjectType } from "@nestjs/graphql"

import { Invitation } from "@/invitations/entities/invitation.entity"

@ObjectType()
export class InvitationResponse {
  @Field(() => Invitation)
  invitation: Invitation
}
