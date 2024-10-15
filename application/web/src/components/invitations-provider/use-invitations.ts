import { createContext, useCallback, useContext } from "react"
import { useList } from "react-use"

import {
  InvitationFragmentFragment,
  SendInvitationInput,
} from "@/codegen/__generated__/gql/graphql"
import { useSendInvitation } from "@/hooks/invitations/use-send-invitation"

export function useInvitationsStore() {
  const [invitations, { filter, set, upsert }] =
    useList<InvitationFragmentFragment>([])

  const removeInvitation = useCallback(
    (invitation: InvitationFragmentFragment) => {
      filter((inv) => inv.id !== invitation.id)
    },
    [filter]
  )
  const addInvitation = useCallback(
    (invitation: InvitationFragmentFragment) => {
      upsert(
        (inList, nextInvitation) => inList.id === nextInvitation.id,
        invitation
      )
    },
    [upsert]
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
    setInvitations: set,
  }
}

export const InvitationsContext = createContext<
  ReturnType<typeof useInvitationsStore> | undefined
>(undefined)
InvitationsContext.displayName = "InvitationsContext"
export function useInvitations() {
  const ctx = useContext(InvitationsContext)
  if (ctx) {
    return ctx
  }
  throw new Error("useInvitation should be wrapped in to InvitationsProvider.")
}
