import { Field, ID, InputType } from "@nestjs/graphql"
import {
  IsEnum,
  IsNumber,
  isNumber,
  IsOptional,
  registerDecorator,
  type ValidationArguments,
} from "class-validator"

import { invitationStatus } from "@/entities/invitation.entity"

@InputType()
export class SendInvitationInput {
  @IsOptional()
  @IsNumber()
  @Field(() => ID, { nullable: true })
  id?: number

  @isReceiverIdRequired()
  @Field(() => ID, { nullable: true })
  receiverId?: number

  @IsEnum(invitationStatus)
  @Field(() => invitationStatus)
  status: invitationStatus
}

function isReceiverIdRequired() {
  return function (object: SendInvitationInput, propertyName: string) {
    registerDecorator({
      constraints: [],
      name: "isReceiverIdNumber",
      options: {
        message: "receiverId must be a number",
      },
      propertyName: propertyName,
      target: object.constructor,
      validator: {
        validate(receiverId: any, args: ValidationArguments) {
          const id = args.object["id"]
          if (id) {
            return !receiverId
          }
          if (!id) {
            return isNumber(receiverId)
          }
        },
      },
    })
  }
}
