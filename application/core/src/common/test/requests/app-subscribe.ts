import { INestApplication } from "@nestjs/common"
import { createClient } from "graphql-ws"

export async function appsubscribe({
  app,
  query,
  token,
}: {
  app: INestApplication<any>
  query: string
  token?: string
}) {
  const url = `http://127.0.0.1:${app.getHttpServer().address().port}/graphql`
  const client = createClient({
    connectionParams: {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
    url,
  })

  const sub = client.iterate({
    query,
  })

  return { sub }
}
