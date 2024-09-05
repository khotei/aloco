import { createContext, useCallback, useContext, useState } from "react"

import {
  InvitationFragmentFragment,
  SendInvitationInput,
} from "@/codegen/__generated__/gql/graphql"
import { useSendInvitation } from "@/hooks/use-send-invitation"

export function useInvitationsStore() {
  const [invitations, setInvitations] = useState<InvitationFragmentFragment[]>(
    []
  )
  const removeInvitation = useCallback(
    (invitation: InvitationFragmentFragment) => {
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id))
    },
    []
  )
  const addInvitation = useCallback(
    (invitation: InvitationFragmentFragment) => {
      setInvitations((prev) => {
        const next = Array.of(...prev)
        const existedIndex = prev.findIndex((inv) => inv.id === invitation.id)
        if (existedIndex !== -1 && next[existedIndex]) {
          next[existedIndex] = invitation
        } else {
          next.push(invitation)
        }
        return next
      })
    },
    []
  )

  const [send] = useSendInvitation()
  const sendInvitation = useCallback(
    async (input: SendInvitationInput) => {
      const { data } = await send({
        variables: {
          input,
        },
      })
      const invitation = data?.sendInvitation.invitation
      if (!invitation) {
        throw new Error("Failed")
      }
      addInvitation(invitation)
      return invitation
    },
    [addInvitation, send]
  )

  return {
    addInvitation,
    invitations,
    removeInvitation,
    sendInvitation,
    setInvitations,
  }
}

export const invitationsContext = createContext<
  ReturnType<typeof useInvitationsStore> | undefined
>(undefined)
invitationsContext.displayName = "InvitationsContext"
export function useInvitations() {
  const ctx = useContext(invitationsContext)
  if (ctx) {
    return ctx
  }
  throw new Error("useInvitation should be wrapped in to InvitationsProvider.")
}
