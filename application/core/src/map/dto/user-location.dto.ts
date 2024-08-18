import { Field, ObjectType } from "@nestjs/graphql"

import { UserLocation } from "@/map/entities/user-location.entity"

@ObjectType()
export class UserLocationResponse {
  @Field(() => UserLocation)
  userLocation: UserLocation
}
