import { Field, Mutation, ObjectType, Query, Resolver } from "@nestjs/graphql"

@ObjectType()
class Registration {
  @Field()
  token: string
}

@Resolver()
export class AuthenticationResolver {
  @Mutation(() => Registration, { name: "registerTemporalUser" })
  async createTemporalUser(): Promise<Registration> {
    return { token: "fake-token" }
  }

  @Query(() => String, { name: "test" })
  test() {
    return "test"
  }
}
