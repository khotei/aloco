import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { PubSub } from "graphql-subscriptions"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

// import type { Invitation as GqlInvitationResponse } from "@/__generated__/scheme.generated"
import type { InvitationResponseUnion } from "@/dto/invitations/invitation-response-union.dto"

export type InvitationSentEvent = {
  invitationSent: typeof InvitationResponseUnion
}

export const INVITATION_SENT_EVENT_KEY = "invitationSent"

@Injectable()
export class InvitationSentInterceptor implements NestInterceptor {
  constructor(private readonly pubSub: PubSub) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (invitationRes: typeof InvitationResponseUnion) => {
        await this.pubSub.publish(
          INVITATION_SENT_EVENT_KEY,
          buildInvitationEvent(invitationRes)
        )
      })
    )
  }
}

export function buildInvitationEvent(
  invitationRes: typeof InvitationResponseUnion
): InvitationSentEvent {
  return {
    [INVITATION_SENT_EVENT_KEY]: invitationRes,
  }
}
