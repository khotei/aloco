import { Field, InputType } from "@nestjs/graphql"
import { IsNumber, ValidateNested } from "class-validator"

@InputType()
class LocationInput {
  @IsNumber()
  @Field()
  lat: number

  @IsNumber()
  @Field()
  lng: number
}

@InputType()
export class SaveUserLocationInput {
  @ValidateNested()
  @Field(() => LocationInput)
  location: LocationInput
}
