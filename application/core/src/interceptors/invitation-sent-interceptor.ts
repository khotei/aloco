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

@Injectable()
export class InvitationSentInterceptor implements NestInterceptor {
  constructor(private readonly pubSub: PubSub) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(async (result: InvitationResponse) => {
        if (result.invitation) {
          await this.pubSub.publish("invitationSent", {
            invitation: result.invitation,
          })
        }
      })
    )
  }
}
