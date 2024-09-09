import { useInvitations } from "@/components/invitations-provider"
import { useInvitationSub } from "@/hooks/invitations/use-invitation-sub"

import { Invitation } from "./invitation"
import { ToastContainer } from "./toast"

export function Invitations() {
  const { addInvitation, invitations } = useInvitations()
  useInvitationSub({
    onData: ({ data }) => {
      if (data) {
        addInvitation(data.invitationSent.invitation)
      }
    },
  })

  return (
    <>
      {invitations.map((inv) => (
        <Invitation
          invitation={inv}
          key={inv.id}
        />
      ))}
      <ToastContainer />
    </>
  )
}
