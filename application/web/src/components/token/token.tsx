import { useLocalStorage } from "@uidotdev/usehooks"
import { type ReactNode } from "react"

import { tokenCtx } from "./use-token"

export const TokenProvider = ({
  children,
  token,
}: {
  children: ((token: null | string | undefined) => ReactNode) | ReactNode
  token: null | string
}) => {
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
