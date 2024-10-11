import { ChakraProvider, Spinner } from "@chakra-ui/react"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { Suspense, useMemo } from "react"

import { routeTree } from "@/codegen/__generated__/routes"
import { ApolloClientProvider } from "@/components/apollo-client/apollo-client"
import { AuthInitializer } from "@/components/auth-initializer"
import { TokenProvider } from "@/components/token"
import { useAuthUser } from "@/hooks/auth/use-auth-user"

export function App() {
  return (
    <ChakraProvider>
      <TokenProvider>
        {(token) => (
          <ApolloClientProvider token={token}>
            <Suspense fallback={<Spinner />}>
              <AuthInitializer />
              <Routes />
            </Suspense>
          </ApolloClientProvider>
        )}
      </TokenProvider>
    </ChakraProvider>
  )
}

function Routes() {
  const router = useMemo(() => createRouter({ routeTree }), [])
  const { data: authData } = useAuthUser()
  const authUser = authData?.authUser.user
  return authUser ? <RouterProvider router={router} /> : null
}
