import { INestApplication } from "@nestjs/common"

import { apprequest } from "@/api/tests/requests/app-request"

export async function requestSignUp({ app }: { app: INestApplication<any> }) {
  const {
    registerTemporalUser: { token },
  } = await apprequest({ app }).RegisterTemporalUser()
  const {
    authUser: { user },
  } = await apprequest({
    app,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).AuthUser()

  return { token, user }
}
