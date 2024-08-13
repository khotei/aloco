import { Field, ID, InputType } from "@nestjs/graphql"

@InputType()
class LocationInput {
  @Field()
  lat: number

  @Field()
  lng: number
}

@InputType()
export class SaveUserLocationInput {
  @Field(() => ID, { nullable: true })
  id?: number

  @Field(() => LocationInput)
  location: LocationInput
}
