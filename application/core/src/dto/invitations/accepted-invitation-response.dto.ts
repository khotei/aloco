import { Field, ObjectType } from "@nestjs/graphql"

import { Invitation } from "@/entities/invitation.entity"
import { Room } from "@/entities/room.entity"

@ObjectType()
export class AcceptedInvitationResponse {
  @Field(() => Invitation)
  invitation: Invitation

  @Field(() => Room)
  room: Room
}
