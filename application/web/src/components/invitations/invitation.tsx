import { AlertStatus } from "@chakra-ui/alert"
import {
  createStandaloneToast,
  type ToastId,
  type UseToastOptions,
} from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"

import {
  type InvitationFragmentFragment,
  InvitationStatus,
} from "@/codegen/__generated__/gql/graphql"
import { useInvitations } from "@/components/invitations-provider"

import { InvitationDescription } from "./invitation-description"

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
  }, [toast, toastId])

  /**
   * @todo: fix toast that out of token provider
   * WTF???
   * why it doesn't get context
   *
   * workaround is to pass outside as props
   */
  const toastProps: UseToastOptions = useMemo(
    () => ({
      description: <InvitationDescription invitation={invitation} />,
      status: invitationToastStatus[invitation.status],
    }),
    [invitation]
  )
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
  }, [invitation, lastInvitation.status, toast, toastId, toastProps])

  /**
   * @todo: imp. timout on BE and emit it.
   * track this status and show notification.
   */
  const { removeInvitation } = useInvitations()
  const navigate = useNavigate()
  useEffect(() => {
    const timeout =
      // pending 10000 timeout + 4000 info message (timeout)
      invitation.status === InvitationStatus.Pending ? 14000 : 4000
    const timeoutId = setTimeout(() => {
      if (invitation.status === InvitationStatus.Accepted) {
        navigate({ to: "/room/10" })
      }
      //
      // if (toastId) {
      //   toast.close(toastId)
      // }
      // removeInvitation(invitation)
    }, timeout)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [invitation, navigate, removeInvitation, toast, toastId])

  return null
}

export const { toast, ToastContainer } = createStandaloneToast({
  defaultOptions: {
    duration: null,
    position: "bottom-right",
    title: "Invitation.",
  },
})

const invitationToastStatus: Record<InvitationStatus, AlertStatus> = {
  [InvitationStatus.Accepted]: "success",
  [InvitationStatus.Canceled]: "info",
  [InvitationStatus.Pending]: "loading",
  [InvitationStatus.Rejected]: "warning",
  [InvitationStatus.Timeout]: "error",
}
