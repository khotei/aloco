import {useLocalStorage} from "@uidotdev/usehooks";
import {createContext, type ReactNode, useContext} from "react";

const tokenCtx = createContext<[null | string | undefined, (token: null | string | undefined) => void] | undefined>(undefined)

export const useToken = () => {
  const ctx = useContext(tokenCtx)
  if (!ctx) {
    throw new Error('You should be wrapped into TokenProvider.')
  } else {
    return ctx;
  }
}

export const TokenProvider = ({children, token}: { children: ((token: null | string | undefined) => ReactNode) | ReactNode, token: null | string }) => {
  const ctx = useLocalStorage<null | string | undefined>("token", token);
  return <tokenCtx.Provider value={ctx}>
    {typeof children === "function" ? children(ctx[0]) : children}
  </tokenCtx.Provider>
}