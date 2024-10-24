import { Field, ObjectType } from "@nestjs/graphql"

import { Invitation } from "@/domain/entities/invitation.entity"
import { Room } from "@/domain/entities/room.entity"

@ObjectType()
export class AcceptedInvitationResponse {
  @Field(() => Invitation)
  invitation: Invitation

  @Field(() => Room)
  room: Room
}
