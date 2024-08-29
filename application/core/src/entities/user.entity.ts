import { Field, ID, ObjectType } from "@nestjs/graphql"
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

@Entity()
@ObjectType()
export class User {
  @CreateDateColumn()
  @Field()
  createdAt: Date

  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  @UpdateDateColumn()
  @Field()
  updatedAt: Date
}
