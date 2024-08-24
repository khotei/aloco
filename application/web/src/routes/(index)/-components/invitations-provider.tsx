import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"

import {
  type InvitationFragmentFragment,
  type SendInvitationInput,
} from "@/codegen/__generated__/gql/graphql"
import { useSendInvitation } from "@/hooks/use-send-invitation"

const invitationsContext = createContext<
  ReturnType<typeof useInvitationsStore> | undefined
>(undefined)

function useInvitationsStore() {
  const [invitations, setInvitations] = useState<InvitationFragmentFragment[]>(
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

      const next = Array.of(...invitations)
      const existedIndex = invitations.findIndex(
        (inv) => inv.id === invitation.id
      )
      if (existedIndex && next[existedIndex]) {
        next[existedIndex] = invitation
      } else {
        next.push(invitation)
      }
      setInvitations(invitations)
      return invitation
    },
    [invitations, send]
  )

  return {
    invitations,
    sendInvitation,
    setInvitations,
  }
}

export function useInvitations() {
  const ctx = useContext(invitationsContext)
  if (ctx) {
    return ctx
  }
  throw new Error("useInvitation should be wrapped in to InvitationsProvider")
}

export function InvitationsProvider({ children }: { children: ReactNode }) {
  const ctx = useInvitationsStore()
  return (
    <invitationsContext.Provider value={ctx}>
      {children}
    </invitationsContext.Provider>
  )
}
