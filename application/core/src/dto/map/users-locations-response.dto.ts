import { Field, ObjectType } from "@nestjs/graphql"

import { UserLocation } from "@/entities/user-location.entity"

@ObjectType()
export class UsersLocationsResponse {
  @Field(() => [UserLocation])
  usersLocations: UserLocation[]
}
