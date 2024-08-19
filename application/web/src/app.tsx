import {ApolloClient, ApolloProvider, InMemoryCache} from "@apollo/client";
import {createContext, type ReactNode, useContext, useMemo} from "react";
import {useLocalStorage} from "@uidotdev/usehooks";
import { ChakraProvider } from '@chakra-ui/react'
import {createRouter, RouterProvider} from "@tanstack/react-router";
import { routeTree } from './routeTree.gen'

const tokenCtx = createContext<[string | undefined | null, (token: undefined | null | string) => void] | undefined>(undefined)

const useToken = () => {
  const ctx = useContext(tokenCtx)
  if(!ctx) {
    throw new Error('You should be wrapped into TokenProvider.')
  } else {
    return ctx;
  }
}

const TokenProvider = ({ children, token }: { children: ReactNode, token: string | null }) => {
  const ctx = useLocalStorage<null | undefined | string>("token", token);
  return <tokenCtx.Provider value={ctx}>
    {children}
  </tokenCtx.Provider>
}


// Create a new router instance
const router = createRouter({ routeTree })

export function App() {
  const [token] = useLocalStorage("token", null);
  /**
   * @todo: if no token then create user and set token
   */
  /**
   * @todo: if token exists -> fetch auth user
   */
  return (
    <ChakraProvider>
      <TokenProvider token={token}>
        <ClientProvider>
          <RouterProvider router={router} />
        </ClientProvider>
      </TokenProvider>
    </ChakraProvider>

  )
}

function ClientProvider({ children }: { children: ReactNode }) {
  const [token] = useToken()
  const client = useMemo(() => new ApolloClient({
    uri: 'http://localhost:4000',
    cache: new InMemoryCache(),
    defaultContext: {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : undefined),
      }
    }
  }), [])

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}