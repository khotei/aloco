import { createParamDecorator, type ExecutionContext } from "@nestjs/common"
import { GqlExecutionContext } from "@nestjs/graphql"

export interface AuthPayload {
  userId: number
}

export const Auth = createParamDecorator(
  (data: unknown, context: ExecutionContext): AuthPayload => {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req.auth
  }
)
