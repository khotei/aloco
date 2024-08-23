import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql"
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
  @CreateDateColumn()
  @Field()
  createdAt: Date

  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number

  @JoinColumn()
  @OneToOne(() => User, { eager: true })
  @Field(() => User)
  receiver: User

  @JoinColumn()
  @OneToOne(() => User, { eager: true })
  @Field(() => User)
  sender: User

  @Column({ enum: invitationStatus, type: "enum" })
  @Field(() => invitationStatus)
  status: invitationStatus

  @UpdateDateColumn()
  @Field()
  updatedAt: Date
}
