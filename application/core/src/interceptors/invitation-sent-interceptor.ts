import { InjectQueue } from "@nestjs/bull"
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Queue } from "bull"
import { PubSub } from "graphql-subscriptions"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

import type { InvitationResponseUnion } from "@/dto/invitations/invitation-response-union.dto"

export type InvitationSentEventPayload = {
  invitationSent: InvitationResponseUnion
}

export const INVITATION_SENT_EVENT_KEY = "invitationSent"
export const INVITATION_TIMEOUT_QUEUE_KEY = "invitation-timeout"

@Injectable()
export class InvitationSentInterceptor implements NestInterceptor {
  constructor(
    private readonly pubSub: PubSub,
    @InjectQueue(INVITATION_TIMEOUT_QUEUE_KEY) private queue: Queue
  ) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (invitationRes: InvitationResponseUnion) => {
        await Promise.all([
          this.pubSub.publish(
            INVITATION_SENT_EVENT_KEY,
            buildInvitationEvent(invitationRes)
          ),
          /**
           * @todo: add test case.
           *
           * set delay as const and inject as provider
           * to change it during testing.
           */
          this.queue.add(invitationRes, {
            delay: 10_000,
          }),
        ])
      })
    )
  }
}

export function buildInvitationEvent(
  invitationRes: InvitationResponseUnion
): InvitationSentEventPayload {
  return {
    [INVITATION_SENT_EVENT_KEY]: invitationRes,
  }
}
