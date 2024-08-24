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
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  type InvitationFragmentFragment,
  InvitationStatus,
} from "@/codegen/__generated__/gql/graphql"
import { useSendInvitation } from "@/hooks/use-send-invitation"

const invitationToastStatus: Record<InvitationStatus, AlertStatus> = {
  [InvitationStatus.Accepted]: "success",
  [InvitationStatus.Canceled]: "info",
  [InvitationStatus.Pending]: "loading",
  [InvitationStatus.Rejected]: "warning",
  [InvitationStatus.Timeout]: "error",
}

export function Invitation({
  invitation: initial,
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

  const [invitation, setInvitation] =
    useState<InvitationFragmentFragment>(initial)
  const [lastInvitation, setLastInvitation] =
    useState<InvitationFragmentFragment>(initial)

  const [send, { loading }] = useSendInvitation()
  const handleCancel = useCallback(async () => {
    const { data } = await send({
      variables: {
        input: {
          id: invitation.id,
          status: InvitationStatus.Canceled,
        },
      },
    })
    const updatedInvitation = data?.sendInvitation.invitation
    if (updatedInvitation) {
      setInvitation(updatedInvitation)
    }
  }, [invitation.id, send])
  const handleCloseComplete = useCallback(async () => {
    if (invitation.status === InvitationStatus.Pending) {
      await handleCancel()
    }
  }, [handleCancel, invitation.status])

  const toastProps: UseToastOptions = useMemo(
    () => ({
      description: (
        <InvitationDescription
          invitation={invitation}
          isCancelling={loading}
          onCancel={handleCancel}
        />
      ),
      duration: null,
      isClosable: true,
      onCloseComplete: handleCloseComplete,
      position: "bottom-right",
      status: invitationToastStatus[invitation.status],
      title: "Invitation.",
    }),
    [handleCancel, handleCloseComplete, invitation, loading]
  )
  useEffect(() => {
    if (!toastId && invitation.status === lastInvitation.status) {
      const toastId = toast(toastProps)

      setToastId(toastId)
    }

    if (toastId && invitation.status !== lastInvitation.status) {
      toast.update(toastId, toastProps)
      setLastInvitation(invitation)
    }
  }, [
    handleCancel,
    invitation,
    invitation.sender.id,
    invitation.status,
    lastInvitation.status,
    loading,
    toast,
    toastId,
    toastProps,
  ])

  /**
   * @todo: imp. timout on BE and emit it.
   * track this status and show notification.
   */
  const timeout = invitation.status === InvitationStatus.Pending ? 10000 : 4000
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (toastId) {
        toast.close(toastId)
      }
    }, timeout)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [timeout, toast, toastId])

  return null
}

export function InvitationDescription({
  invitation,
  isCancelling,
  onCancel,
}: {
  invitation: InvitationFragmentFragment
  isCancelling: boolean
  onCancel: () => void
}) {
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
            User ${invitation.receiver.id} accepted invitation {invitation.id}
          </Text>
        </Flex>
      )
    case InvitationStatus.Rejected:
      return (
        <Flex
          direction={"column"}
          gap={2}>
          <Text>
            User ${invitation.receiver.id} rejected invitation {invitation.id}
          </Text>
        </Flex>
      )
  }
}
