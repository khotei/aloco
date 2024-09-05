import { INestApplication } from "@nestjs/common"

import type { SendInvitationInput } from "@/__generated__/scheme.generated"
import { apprequest } from "@/test/requests/app-request"

export async function requestSendInvitation({
  app,
  input,
  token,
}: {
  app: INestApplication<any>
  input: SendInvitationInput
  token: string
}) {
  const {
    sendInvitation: { invitation },
  } = await apprequest({
    app,
    token,
  }).SendInvitation({
    input,
  })

  return { invitation }
}
