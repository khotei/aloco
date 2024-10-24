import { INestApplication } from "@nestjs/common"

import { InvitationSentDocument } from "@/__generated__/scheme.generated"
import { appsubscribe } from "@/api/tests/requests/app-subscribe"

export async function subscribeInvitationSent({
  app,
  token,
}: {
  app: INestApplication<any>
  token?: string
}) {
  return await appsubscribe({
    app,
    query: InvitationSentDocument.loc.source.body,
    token,
  })
}
