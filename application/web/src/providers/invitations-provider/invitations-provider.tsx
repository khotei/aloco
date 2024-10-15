import { type ReactNode } from "react"

import { InvitationsContext, useInvitationsStore } from "./use-invitations"

export function InvitationsProvider({ children }: { children: ReactNode }) {
  const ctx = useInvitationsStore()
  return (
    <InvitationsContext.Provider value={ctx}>
      {children}
    </InvitationsContext.Provider>
  )
}
