import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { PubSub } from "graphql-subscriptions"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

import type { InvitationResponse } from "@/__generated__/scheme.generated"
import { InvitationResponse as GqlInvitationResponse } from "@/dto/invitations/invitation-response.dto"

export type InvitationSentEvent = {
  invitationSent: GqlInvitationResponse | InvitationResponse
}

export const INVITATION_SENT_EVENT_KEY = "invitationSent"

@Injectable()
export class InvitationSentInterceptor implements NestInterceptor {
  constructor(private readonly pubSub: PubSub) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (invitationRes: InvitationResponse) => {
        await this.pubSub.publish(
          INVITATION_SENT_EVENT_KEY,
          buildInvitationEvent(invitationRes)
        )
      })
    )
  }
}

export function buildInvitationEvent(
  invitationRes: GqlInvitationResponse | InvitationResponse
): InvitationSentEvent {
  return {
    [INVITATION_SENT_EVENT_KEY]: invitationRes,
  }
}
