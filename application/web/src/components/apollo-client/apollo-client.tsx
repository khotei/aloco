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

import { useToken } from "@/components/token"

export function ApolloClientProvider({ children }: { children: ReactNode }) {
  const [token] = useToken()
  const options = useMemo(
    () => ({
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : undefined),
      },
    }),
    [token]
  )
  const httpLink = useMemo(
    () =>
      new HttpLink({
        headers: options.headers,
        uri: `${import.meta.env.VITE_CORE_API_URL}/graphql`,
      }),
    [options.headers]
  )
  const wsLink = useMemo(
    () =>
      new GraphQLWsLink(
        createClient({
          connectionParams: options.headers,
          url: `${import.meta.env.VITE_CORE_API_URL}/graphql`,
        })
      ),
    [options.headers]
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
