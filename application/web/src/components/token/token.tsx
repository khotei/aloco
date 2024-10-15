import { type ReactNode } from "react"
import { useLocalStorage } from "react-use"

import { TokenContext } from "./use-token"

export function TokenProvider({ children }: { children: ReactNode }) {
  const ctx = useLocalStorage<string>("token")
  return <TokenContext.Provider value={ctx}>{children}</TokenContext.Provider>
}
