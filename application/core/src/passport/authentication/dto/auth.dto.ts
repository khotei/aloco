import { Field, ObjectType } from "@nestjs/graphql"

import { User } from "@/users/entities/user.entity"

@ObjectType("Auth")
export class AuthDto {
  @Field()
  user: User
}
