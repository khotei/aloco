import { useLocalStorage } from "@uidotdev/usehooks"
import { type ReactNode, useMemo } from "react"

import { tokenCtx } from "./use-token"

export const TokenProvider = ({
  children,
}: {
  children: ((token: null | string | undefined) => ReactNode) | ReactNode
}) => {
  const token = useMemo(() => {
    const tokenInStorage = window.localStorage.getItem("token")
    if (tokenInStorage) {
      return JSON.stringify(tokenInStorage)
    }
    return null
  }, [])
  const ctx = useLocalStorage<null | string | undefined>(
    "token",
    token ?? undefined
  )
  return (
    <tokenCtx.Provider value={ctx}>
      {typeof children === "function" ? children(ctx[0]) : children}
    </tokenCtx.Provider>
  )
}
