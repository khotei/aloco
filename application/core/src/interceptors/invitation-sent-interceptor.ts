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

export type InvitationSentEvent = {
  invitationSent: InvitationResponse
}

export const INVITATION_SENT_EVENT_KEY = "invitationSent"

@Injectable()
export class InvitationSentInterceptor implements NestInterceptor {
  constructor(private readonly pubSub: PubSub) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (invitationRes: InvitationResponse) => {
        await this.pubSub.publish(INVITATION_SENT_EVENT_KEY, {
          [INVITATION_SENT_EVENT_KEY]: invitationRes,
        })
      })
    )
  }
}
