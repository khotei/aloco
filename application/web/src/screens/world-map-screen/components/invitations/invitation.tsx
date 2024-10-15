import { AlertStatus } from "@chakra-ui/alert"
import { type ToastId, type UseToastOptions } from "@chakra-ui/react"
import { useEffect, useMemo, useRef } from "react"
import { useTimeoutFn } from "react-use"

import {
  type InvitationFragmentFragment,
  InvitationStatus,
} from "@/codegen/__generated__/gql/graphql"
import { useRequireAuthUser } from "@/hooks/auth/use-auth-user"
import { useInvitations } from "@/providers/invitations-provider"

import { InvitationDescription } from "./invitation-description"
import { toast } from "./toast"

export function Invitation({
  invitation,
}: {
  invitation: InvitationFragmentFragment
}) {
  const { authUser } = useRequireAuthUser()
  const { sendInvitation } = useInvitations()
  const { removeInvitation } = useInvitations()
  const toastIdRef = useRef<ToastId>()
  const toastProps: UseToastOptions = useMemo(
    () => ({
      description: (
        <InvitationDescription
          authUser={authUser}
          invitation={invitation}
          sendInvitation={sendInvitation}
        />
      ),
      status: invitationToastStatus[invitation.status],
    }),
    [authUser, invitation, sendInvitation]
  )
  useEffect(() => {
    if (!toastIdRef.current) {
      toastIdRef.current = toast(toastProps)
    } else {
      toast.update(toastIdRef.current, toastProps)
    }
  }, [invitation, toastProps])
  useTimeoutFn(
    () => {
      if (toastIdRef.current) {
        toast.close(toastIdRef.current)
      }
      removeInvitation(invitation)
    },
    invitation.status === InvitationStatus.Pending ? 14000 : 4000
  )
  return null
}

const invitationToastStatus: Record<InvitationStatus, AlertStatus> = {
  [InvitationStatus.Accepted]: "success",
  [InvitationStatus.Canceled]: "info",
  [InvitationStatus.Pending]: "loading",
  [InvitationStatus.Rejected]: "warning",
  [InvitationStatus.Timeout]: "error",
}
