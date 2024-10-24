import { Field, ObjectType } from "@nestjs/graphql"

import { UserLocation } from "@/domain/entities/user-location.entity"

@ObjectType()
export class UserLocationResponse {
  @Field(() => UserLocation)
  userLocation: UserLocation
}
