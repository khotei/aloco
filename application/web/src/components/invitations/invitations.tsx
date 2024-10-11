import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { InvitationStatus } from "@/codegen/__generated__/gql/graphql"
import { useInvitations } from "@/components/invitations-provider"
import { useInvitationSub } from "@/hooks/invitations/use-invitation-sub"

import { Invitation } from "./invitation"
import { ToastContainer } from "./toast"

export function Invitations() {
  const { addInvitation, invitations } = useInvitations()
  const [roomId, setRoomId] = useState<string | undefined>()
  useInvitationSub({
    onData: ({ data }) => {
      if (data) {
        addInvitation(data.invitationSent.invitation)
        if (
          data.invitationSent.invitation.status === InvitationStatus.Accepted &&
          "room" in data.invitationSent
        ) {
          setRoomId(data.invitationSent.room.id)
        }
      }
    },
  })
  /**
   * @todo: try to move this logic to the Invitation component
   */
  const navigate = useNavigate()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (roomId) {
        navigate({ to: `/room/${roomId}` })
      }
    }, 4000)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [navigate, roomId])

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
