import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { getMainDefinition } from "@apollo/client/utilities"
import { createClient } from "graphql-ws"
import { type ReactNode, useMemo } from "react"

export function ApolloClientProvider({
  children,
  token,
}: {
  children: ReactNode
  token: null | string | undefined
}) {
  const httpLink = useMemo(
    () =>
      new HttpLink({
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : undefined),
        },
        uri: `${import.meta.env.VITE_CORE_API_URL}/graphql`,
      }),
    [token]
  )
  const wsLink = useMemo(
    () =>
      new GraphQLWsLink(
        createClient({
          connectionParams: {
            ...(token ? { Authorization: `Bearer ${token}` } : undefined),
          },
          url: "ws://localhost:4000/graphql",
        })
      ),
    [token]
  )
  const splitLink = useMemo(
    () =>
      split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          )
        },
        wsLink,
        httpLink
      ),
    [httpLink, wsLink]
  )
  const client = useMemo(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        link: splitLink,
      }),
    [splitLink]
  )

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
