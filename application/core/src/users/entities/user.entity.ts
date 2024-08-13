import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number
}
