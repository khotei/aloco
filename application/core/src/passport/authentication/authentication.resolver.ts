import { Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class AuthenticationResolver {
  @Query(() => String)
  register() {
    return "register"
  }
}
