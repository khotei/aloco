import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql"
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

import { User } from "@/entities/user.entity"

export enum invitationStatus {
  ACCEPTED = "ACCEPTED",
  CANCELED = "CANCELED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  TIMEOUT = "TIMEOUT",
}

registerEnumType(invitationStatus, {
  name: "InvitationStatus",
})

@Entity()
@ObjectType()
export class Invitation {
  @CreateDateColumn({ type: "timestamptz" })
  @Field()
  createdAt: Date

  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  @JoinColumn()
  @ManyToOne(() => User, { eager: true })
  @Field(() => User)
  receiver: User

  @JoinColumn()
  @ManyToOne(() => User, { eager: true })
  @Field(() => User)
  sender: User

  @Column({ enum: invitationStatus, type: "enum" })
  @Field(() => invitationStatus)
  status: invitationStatus

  @UpdateDateColumn({ type: "timestamptz" })
  @Field()
  updatedAt: Date
}
