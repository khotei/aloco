import { Field, ID, ObjectType } from "@nestjs/graphql"
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm"

import { User } from "@/users/entities/user.entity"

@Entity()
@ObjectType()
export class UserLocation {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  @Column({
    type: "json",
  })
  @Field(() => [Number])
  location: [number, number]

  @JoinColumn()
  @OneToOne(() => User, { eager: true })
  @Field(() => User)
  user: User
}
