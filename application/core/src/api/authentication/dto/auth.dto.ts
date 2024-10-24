import { Field, ObjectType } from "@nestjs/graphql"

import { User } from "@/domain/entities/user.entity"

@ObjectType()
export class AuthResponse {
  @Field()
  user: User
}
