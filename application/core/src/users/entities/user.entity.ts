import { Field, ID, ObjectType } from "@nestjs/graphql"
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
@ObjectType()
export class User {
  @Column({ nullable: true, unique: true })
  email: string

  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  password: string
}
