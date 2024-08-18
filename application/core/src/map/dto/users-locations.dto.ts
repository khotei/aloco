import { Field, ObjectType } from "@nestjs/graphql"

import { UserLocation } from "@/map/entities/user-location.entity"

@ObjectType()
export class UsersLocationsResponse {
  @Field(() => [UserLocation])
  usersLocations: UserLocation[]
}
