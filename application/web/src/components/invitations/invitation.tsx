import { AlertStatus } from "@chakra-ui/alert"
import { type ToastId, type UseToastOptions } from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"

import {
  type InvitationFragmentFragment,
  InvitationStatus,
} from "@/codegen/__generated__/gql/graphql"
import { useInvitations } from "@/components/invitations-provider"
import { useAuthUser } from "@/hooks/auth/use-auth-user"

import { InvitationDescription } from "./invitation-description"
import { toast } from "./toast"

export function Invitation({
  invitation,
}: {
  invitation: InvitationFragmentFragment
}) {
  const [toastId, setToastId] = useState<null | ToastId>(null)
  /**
   * @todo: do we need this in dev mod?
   * issue when live reload page after change it creates multiple toasts
   */
  useEffect(() => {
    return () => {
      if (toastId) {
        toast.close(toastId)
      }
    }
  }, [toastId])

  const auth = useAuthUser()
  const { sendInvitation } = useInvitations()
  const toastProps: UseToastOptions = useMemo(() => {
    if (!auth.data) {
      throw new Error("User should be authenticated.")
    }
    return {
      description: (
        <InvitationDescription
          authUser={auth.data.authUser.user}
          invitation={invitation}
          sendInvitation={sendInvitation}
        />
      ),
      status: invitationToastStatus[invitation.status],
    }
  }, [auth.data, invitation, sendInvitation])
  const [lastInvitation, setLastInvitation] =
    useState<InvitationFragmentFragment>(invitation)
  useEffect(() => {
    if (!toastId && invitation.status === lastInvitation.status) {
      const toastId = toast(toastProps)
      setToastId(toastId)
    }

    if (toastId && invitation.status !== lastInvitation.status) {
      toast.update(toastId, toastProps)
      setLastInvitation(invitation)
    }
  }, [invitation, lastInvitation.status, toastId, toastProps])

  const { removeInvitation } = useInvitations()
  /**
   * @todo: try to replace with useTimeout
   */
  useEffect(() => {
    const timeout =
      // pending 10000 timeout + 4000 info message (timeout)
      invitation.status === InvitationStatus.Pending ? 14000 : 4000
    const timeoutId = setTimeout(() => {
      if (toastId) {
        toast.close(toastId)
      }
      removeInvitation(invitation)
    }, timeout)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [invitation, removeInvitation, toastId])

  return null
}

const invitationToastStatus: Record<InvitationStatus, AlertStatus> = {
  [InvitationStatus.Accepted]: "success",
  [InvitationStatus.Canceled]: "info",
  [InvitationStatus.Pending]: "loading",
  [InvitationStatus.Rejected]: "warning",
  [InvitationStatus.Timeout]: "error",
}
