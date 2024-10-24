import { Field, ObjectType } from "@nestjs/graphql"

import { Invitation } from "@/domain/entities/invitation.entity"

@ObjectType()
export class InvitationResponse {
  @Field(() => Invitation)
  invitation: Invitation
}
