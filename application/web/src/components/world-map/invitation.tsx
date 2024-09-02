import { AlertStatus } from "@chakra-ui/alert"
import {
  Box,
  Button,
  Flex,
  Text,
  type ToastId,
  useToast,
  type UseToastOptions,
} from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  type InvitationFragmentFragment,
  InvitationStatus,
  type UserFragmentFragment,
} from "@/codegen/__generated__/gql/graphql"
import { useInvitations } from "@/components/invitations-provider"
import { useAuthUser } from "@/hooks/use-auth-user"

export function Invitation({
  invitation,
}: {
  invitation: InvitationFragmentFragment
}) {
  const toast = useToast()
  const [toastId, setToastId] = useState<null | ToastId | undefined>()
  useEffect(() => {
    return () => {
      if (toastId) {
        toast.close(toastId)
      }
    }
  }, [toast, toastId])

  const { removeInvitation, sendInvitation } = useInvitations()
  /**
   * @todo: make single loading with variants
   */
  const [isCanceling, setIsCanceling] = useState(false)
  /**
   * @todo: join handlers in to one just put status
   */
  const handleCancel = useCallback(async () => {
    try {
      setIsCanceling(true)
      await sendInvitation({
        id: invitation.id,
        status: InvitationStatus.Canceled,
      })
    } finally {
      setIsCanceling(false)
    }
  }, [invitation.id, sendInvitation])
  const handleAccept = useCallback(async () => {
    try {
      setIsCanceling(true)
      await sendInvitation({
        id: invitation.id,
        status: InvitationStatus.Accepted,
      })
    } finally {
      setIsCanceling(false)
    }
  }, [invitation.id, sendInvitation])
  const handleReject = useCallback(async () => {
    try {
      setIsCanceling(true)
      await sendInvitation({
        id: invitation.id,
        status: InvitationStatus.Rejected,
      })
    } finally {
      setIsCanceling(false)
    }
  }, [invitation.id, sendInvitation])
  const handleCloseComplete = useCallback(async () => {
    if (invitation.status === InvitationStatus.Pending) {
      await handleCancel()
    }
    removeInvitation(invitation)
  }, [handleCancel, invitation, removeInvitation])

  /**
   * @todo: fix toast that out of token provider
   */
  const auth = useAuthUser()
  const toastProps: UseToastOptions = useMemo(() => {
    if (!auth.data) {
      throw new Error("User should be authenticated.")
    }
    return {
      description: (
        <InvitationDescription
          authUser={auth.data.authUser.user}
          invitation={invitation}
          isCancelling={isCanceling}
          onAccept={handleAccept}
          onCancel={handleCancel}
          onReject={handleReject}
        />
      ),
      duration: null,
      onCloseComplete: handleCloseComplete,
      position: "bottom-right",
      status: invitationToastStatus[invitation.status],
      title: "Invitation.",
    }
  }, [
    auth.data,
    handleAccept,
    handleCancel,
    handleCloseComplete,
    handleReject,
    invitation,
    isCanceling,
  ])
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
  const navigate = useNavigate()
  useEffect(() => {
    const timeout =
      // 10000 timeout + 3000 show timeout text
      invitation.status === InvitationStatus.Pending ? 14000 : 4000
    const timeoutId = setTimeout(() => {
      if (invitation.status === InvitationStatus.Accepted) {
        navigate({ to: "/room/10" })
      }

      if (
        [
          InvitationStatus.Accepted,
          InvitationStatus.Canceled,
          InvitationStatus.Rejected,
          InvitationStatus.Timeout,
        ].includes(invitation.status)
      ) {
        if (toastId) {
          toast.close(toastId)
        }
        removeInvitation(invitation)
      }
    }, timeout)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [invitation, navigate, removeInvitation, toast, toastId])

  return null
}

export function InvitationDescription({
  authUser,
  invitation,
  isCancelling,
  onAccept,
  onCancel,
  onReject,
}: {
  authUser: UserFragmentFragment
  invitation: InvitationFragmentFragment
  isCancelling: boolean
  onAccept: () => void
  onCancel: () => void
  onReject: () => void
}) {
  if (authUser.id === invitation.receiver.id) {
    /**
     * @todo: try to refactor to object
     */
    switch (invitation.status) {
      case InvitationStatus.Pending:
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>
              Invitation {invitation.id} waiting for response from{" "}
              {invitation.sender.id}.
            </Text>
            <Box>
              <Button
                onClick={onAccept}
                size={"sm"}>
                Accept
              </Button>
              <Button
                onClick={onReject}
                size={"sm"}>
                Reject
              </Button>
            </Box>
          </Flex>
        )
      case InvitationStatus.Canceled:
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>Receiver canceled invitation {invitation.id}.</Text>
          </Flex>
        )
      case InvitationStatus.Timeout:
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>Timeout of invitation with id {invitation.id}.</Text>
          </Flex>
        )
      case InvitationStatus.Accepted:
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>You accepted invitation {invitation.id}</Text>
          </Flex>
        )
      case InvitationStatus.Rejected:
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>You rejected invitation {invitation.id}</Text>
          </Flex>
        )
    }
  }

  /**
   * @todo: try to refactor to object
   */
  switch (invitation.status) {
    case InvitationStatus.Pending:
      return (
        <Flex
          direction={"column"}
          gap={2}>
          <Text>
            Invitation {invitation.id} waiting for response from{" "}
            {invitation.sender.id}.
          </Text>
          <Box>
            <Button
              isDisabled={isCancelling}
              isLoading={isCancelling}
              onClick={onCancel}
              size={"sm"}>
              Cancel
            </Button>
          </Box>
        </Flex>
      )
    case InvitationStatus.Canceled:
      return (
        <Flex
          direction={"column"}
          gap={2}>
          <Text>You canceled invitation {invitation.id}.</Text>
        </Flex>
      )
    case InvitationStatus.Timeout:
      return (
        <Flex
          direction={"column"}
          gap={2}>
          <Text>Timeout of invitation with id {invitation.id}.</Text>
        </Flex>
      )
    case InvitationStatus.Accepted:
      return (
        <Flex
          direction={"column"}
          gap={2}>
          <Text>
            User {invitation.receiver.id} accepted invitation {invitation.id}
          </Text>
        </Flex>
      )
    case InvitationStatus.Rejected:
      return (
        <Flex
          direction={"column"}
          gap={2}>
          <Text>
            User {invitation.receiver.id} rejected invitation {invitation.id}
          </Text>
        </Flex>
      )
  }
}

const invitationToastStatus: Record<InvitationStatus, AlertStatus> = {
  [InvitationStatus.Accepted]: "success",
  [InvitationStatus.Canceled]: "info",
  [InvitationStatus.Pending]: "loading",
  [InvitationStatus.Rejected]: "warning",
  [InvitationStatus.Timeout]: "error",
}
