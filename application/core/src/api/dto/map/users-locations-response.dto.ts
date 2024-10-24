import { Field, ObjectType } from "@nestjs/graphql"

import { UserLocation } from "@/domain/entities/user-location.entity"

@ObjectType()
export class UsersLocationsResponse {
  @Field(() => [UserLocation])
  usersLocations: UserLocation[]
}
