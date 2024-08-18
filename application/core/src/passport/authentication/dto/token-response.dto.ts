import { Field, ObjectType } from "@nestjs/graphql"

@ObjectType()
export class TokenResponseDto {
  @Field()
  token: string
}
