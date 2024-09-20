import { InjectQueue } from "@nestjs/bull"
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Queue } from "bull"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

import type { InvitationResponse } from "@/dto/invitations/invitation-response.dto"

export type InvitationSentEvent = {
  invitationSent: InvitationResponse
}

export const INVITATION_TIMEOUT_QUEUE_KEY = "invitation-timeout"

@Injectable()
export class InvitationTimeoutInterceptor implements NestInterceptor {
  constructor(
    @InjectQueue(INVITATION_TIMEOUT_QUEUE_KEY) private queue: Queue
  ) {}
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (invitationRes: InvitationResponse) => {
        await this.queue.add(invitationRes, {
          delay: 10_000,
        })
      })
    )
  }
}
