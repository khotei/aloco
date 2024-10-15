import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useTimeoutFn } from "react-use"

import { InvitationStatus } from "@/codegen/__generated__/gql/graphql"
import { useInvitationSub } from "@/hooks/invitations/use-invitation-sub"
import { useInvitations } from "@/providers/invitations-provider"

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
  const navigate = useNavigate()
  useTimeoutFn(
    async () => {
      if (roomId) {
        await navigate({ to: `/room/${roomId}` })
      }
    },
    roomId ? 4_000 : undefined
  )

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
