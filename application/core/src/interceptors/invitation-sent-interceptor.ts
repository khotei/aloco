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

import { type SystemConfigs, systemConfigs } from "@/configs/environments"
import type { InvitationResponseUnion } from "@/dto/invitations/invitation-response-union.dto"
import { invitationStatus } from "@/entities/invitation.entity"

export type InvitationSentEventPayload = {
  invitationSent: InvitationResponseUnion
}

export const INVITATION_SENT_EVENT_KEY = "invitationSent"
export const INVITATION_TIMEOUT_QUEUE_KEY = "invitation-timeout"

@Injectable()
export class InvitationSentInterceptor implements NestInterceptor {
  constructor(
    private readonly pubSub: PubSub,
    @InjectQueue(INVITATION_TIMEOUT_QUEUE_KEY) private readonly queue: Queue,
    @Inject(systemConfigs.KEY)
    private readonly config: SystemConfigs
  ) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (invitationRes: InvitationResponseUnion) => {
        console.log(this.config.invitationTimeout)
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
          invitationRes.invitation.status === invitationStatus.PENDING
            ? this.queue.add(invitationRes, {
                delay: this.config.invitationTimeout,
                jobId: invitationRes.invitation.id,
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
