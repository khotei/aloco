import { Field, Float, ID, ObjectType } from "@nestjs/graphql"
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

import { User } from "@/users/entities/user.entity"

@Entity()
@ObjectType()
export class UserLocation {
  @CreateDateColumn()
  @Field()
  createdAt: Date

  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  @Column({
    type: "json",
  })
  @Field(() => [Float])
  location: [number, number]

  @UpdateDateColumn()
  @Field()
  updatedAt: Date

  @JoinColumn()
  @OneToOne(() => User, { eager: true })
  @Field(() => User)
  user: User
}
