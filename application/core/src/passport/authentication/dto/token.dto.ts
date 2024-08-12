import { ObjectType } from "@nestjs/graphql"

@ObjectType("Token")
export class TokenDto {
  token: string
}
