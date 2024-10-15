import { ChakraProvider } from "@chakra-ui/react"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { useMemo } from "react"

import { routeTree } from "@/codegen/__generated__/routes"
import { AuthInitializer } from "@/components/auth-initializer"
import { ApolloClientProvider } from "@/providers/apollo-client-provider"
import { TokenProvider } from "@/providers/token-provider"

export function App() {
  const router = useMemo(() => createRouter({ routeTree }), [])
  return (
    <ChakraProvider>
      <TokenProvider>
        <ApolloClientProvider>
          <AuthInitializer>
            <RouterProvider router={router} />
          </AuthInitializer>
        </ApolloClientProvider>
      </TokenProvider>
    </ChakraProvider>
  )
}
