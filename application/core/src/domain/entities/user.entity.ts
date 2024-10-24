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
  @CreateDateColumn({ type: "timestamptz" })
  @Field()
  createdAt: Date

  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  @UpdateDateColumn({ type: "timestamptz" })
  @Field()
  updatedAt: Date
}
