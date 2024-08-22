import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client"
import { type ReactNode, useMemo } from "react"

export function ApolloClientProvider({
  children,
  token,
}: {
  children: ReactNode
  token: null | string | undefined
}) {
  const client = useMemo(
    () =>
      new ApolloClient({
        cache: new InMemoryCache(),
        defaultContext: {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : undefined),
          },
        },
        uri: "http://localhost:4000/graphql",
      }),
    [token]
  )

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
