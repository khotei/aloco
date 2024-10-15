import { createContext, useContext } from "react"
import { useLocalStorage } from "react-use"

export const TokenContext = createContext<
  ReturnType<typeof useLocalStorage<string>> | undefined
>(undefined)

export function useToken() {
  const ctx = useContext(TokenContext)
  if (!ctx) {
    throw new Error("You should be wrapped into TokenProvider.")
  } else {
    return ctx
  }
}
