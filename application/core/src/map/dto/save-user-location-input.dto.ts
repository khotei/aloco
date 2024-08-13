import { Field, ID, InputType } from "@nestjs/graphql"
import { IsNumber, IsOptional, ValidateNested } from "class-validator"

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
  @IsOptional()
  @IsNumber()
  @Field(() => ID, { nullable: true })
  id?: number

  @ValidateNested()
  @Field(() => LocationInput)
  location: LocationInput
}
