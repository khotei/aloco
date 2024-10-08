import { Field, Float, ID, ObjectType } from "@nestjs/graphql"
import { Transform } from "class-transformer"
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

import { User } from "@/entities/user.entity"

@Entity()
@ObjectType()
export class UserLocation {
  @Column({
    type: "json",
  })
  @CreateDateColumn({ type: "timestamptz" })
  @Field()
  createdAt: Date

  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  @Column({ type: "json" })
  @Transform(({ value }) => {
    if (Array.isArray(value) && value.length === 2) {
      const [lat, lng] = value
      return { lat, lng }
    }
    return null
  })
  @Field(() => Location)
  location: [number, number]

  @UpdateDateColumn({ type: "timestamptz" })
  @Field()
  updatedAt: Date

  @JoinColumn()
  @OneToOne(() => User, { eager: true })
  @Field(() => User)
  user: User
}

@ObjectType()
class Location {
  @Field(() => Float)
  lat: number

  @Field(() => Float)
  lng: number
}
