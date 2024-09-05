import { createContext, useContext } from "react"

export const tokenCtx = createContext<
  | [null | string | undefined, (token: null | string | undefined) => void]
  | undefined
>(undefined)
tokenCtx.displayName = "TokenContext"

export const useToken = () => {
  const ctx = useContext(tokenCtx)
  if (!ctx) {
    throw new Error("You should be wrapped into TokenProvider.")
  } else {
    return ctx
  }
}
