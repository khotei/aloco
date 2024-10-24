import { InjectQueue } from "@nestjs/bull"
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Queue } from "bull"
import { PubSub } from "graphql-subscriptions"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

import type { InvitationResponseUnion } from "@/api/dto/invitations/invitation-response-union.dto"
import { invitationStatus } from "@/domain/entities/invitation.entity"

export type InvitationSentEventPayload = {
  invitationSent: InvitationResponseUnion
}

export const INVITATION_SENT_EVENT_KEY = "invitationSent"
export const INVITATION_TIMEOUT_QUEUE_KEY = "invitation-timeout"
export const INVITATION_TIMEOUT_QUEUE_TIME_KEY = "invitation-timeout-time"
export const INVITATION_TIMEOUT_JOB_TIMEOUT = 10_000

@Injectable()
export class InvitationSentInterceptor implements NestInterceptor {
  constructor(
    private readonly pubSub: PubSub,
    @InjectQueue(INVITATION_TIMEOUT_QUEUE_KEY)
    private readonly queue: Queue,
    @Inject(INVITATION_TIMEOUT_QUEUE_TIME_KEY)
    private readonly invitationJobTimeout: number
  ) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (invitationRes: InvitationResponseUnion) => {
        await Promise.all([
          this.pubSub.publish(
            INVITATION_SENT_EVENT_KEY,
            buildInvitationEvent(invitationRes)
          ),
          invitationRes.invitation.status === invitationStatus.PENDING
            ? this.queue.add(invitationRes, {
                delay: this.invitationJobTimeout,
                jobId: invitationRes.invitation.id,
                removeOnComplete: true,
              })
            : this.queue.removeJobs(invitationRes.invitation.id.toString()),
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
