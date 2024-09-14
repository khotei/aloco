import { ChakraProvider, Spinner } from "@chakra-ui/react"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { Suspense, useMemo } from "react"

import { routeTree } from "@/codegen/__generated__/routes"
import { ApolloClientProvider } from "@/components/apollo-client/apollo-client"
import { AuthInitializer } from "@/components/auth-initializer"
import { TokenProvider } from "@/components/token"

export function App() {
  const router = useMemo(() => createRouter({ routeTree }), [])

  return (
    <ChakraProvider>
      <TokenProvider>
        {(token) => (
          <ApolloClientProvider token={token}>
            <Suspense fallback={<Spinner />}>
              <AuthInitializer />
              <RouterProvider router={router} />
            </Suspense>
          </ApolloClientProvider>
        )}
      </TokenProvider>
    </ChakraProvider>
  )
}
