import { INestApplication } from "@nestjs/common"
import { GraphQLClient } from "graphql-request"

import { getSdk } from "@/__generated__/scheme.generated"

export const apprequest = ({
  app,
  headers = {},
}: {
  app: INestApplication<any>
  headers?: Record<string, string>
}) => {
  const client = new GraphQLClient(
    `http://127.0.0.1:${app.getHttpServer().address().port}/graphql`,
    {
      headers,
    }
  )

  return getSdk(client)
}
