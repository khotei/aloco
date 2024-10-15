import { ChakraProvider } from "@chakra-ui/react"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { useMemo } from "react"

import { routeTree } from "@/codegen/__generated__/routes"
import { ApolloClientProvider } from "@/components/apollo-client/apollo-client"
import { AuthInitializer } from "@/components/auth-initializer"
import { TokenProvider } from "@/components/token"

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
