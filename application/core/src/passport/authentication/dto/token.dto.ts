import { Field, ObjectType } from "@nestjs/graphql"

@ObjectType("Token")
export class TokenDto {
  @Field()
  token: string
}
