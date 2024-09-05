import { type ReactNode } from "react"

import { invitationsContext, useInvitationsStore } from "./use-invitations"

export function InvitationsProvider({ children }: { children: ReactNode }) {
  const ctx = useInvitationsStore()
  return (
    <invitationsContext.Provider value={ctx}>
      {children}
    </invitationsContext.Provider>
  )
}
