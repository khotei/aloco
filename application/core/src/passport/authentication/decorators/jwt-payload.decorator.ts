import { createParamDecorator, type ExecutionContext } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"

export interface JwtPayloadInterface {
  email?: string
  sub: number
}

export const JwtPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext): JwtPayloadInterface => {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req.user
  }
)
