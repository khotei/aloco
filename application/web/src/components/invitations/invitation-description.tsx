import { Box, Button, Flex, Text } from "@chakra-ui/react"
import { useCallback, useState } from "react"

import {
  type InvitationFragmentFragment,
  InvitationStatus,
} from "@/codegen/__generated__/gql/graphql"
import { useInvitations } from "@/components/invitations-provider"
import { useAuthUser } from "@/hooks/use-auth-user"

export function InvitationDescription({
  invitation,
}: {
  invitation: InvitationFragmentFragment
}) {
  const { sendInvitation } = useInvitations()
  const [statusLoading, setLoadingStatus] = useState<InvitationStatus | null>(
    null
  )
  const updateInvitation = useCallback(
    async ({ status }: { status: InvitationStatus }) => {
      try {
        setLoadingStatus(status)
        await sendInvitation({
          id: invitation.id,
          status,
        })
      } finally {
        setLoadingStatus(null)
      }
    },
    []
  )
  const handleAccept = useCallback(async () => {
    await updateInvitation({ status: InvitationStatus.Accepted })
  }, [invitation.id, sendInvitation])
  const handleReject = useCallback(async () => {
    await updateInvitation({ status: InvitationStatus.Rejected })
  }, [invitation.id, sendInvitation])
  const handleCancel = useCallback(async () => {
    await updateInvitation({ status: InvitationStatus.Canceled })
  }, [invitation.id, sendInvitation])

  const isCancelling = statusLoading === InvitationStatus.Canceled
  const isAccepting = statusLoading === InvitationStatus.Accepted
  const isRejecting = statusLoading === InvitationStatus.Rejected
  const isLoading = isAccepting || isCancelling || isRejecting

  const auth = useAuthUser()
  if (!auth.data) {
    throw new Error("User should be authenticated.")
  }
  const isAuthUserReceiver =
    auth.data.authUser.user.id === invitation.receiver.id

  switch (invitation.status) {
    case InvitationStatus.Pending:
      if (isAuthUserReceiver) {
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
                isDisabled={isLoading}
                isLoading={isAccepting}
                onClick={handleAccept}
                size={"sm"}>
                Accept
              </Button>
              <Button
                isDisabled={isLoading}
                isLoading={isRejecting}
                onClick={handleReject}
                size={"sm"}>
                Reject
              </Button>
            </Box>
          </Flex>
        )
      } else {
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
                isDisabled={isLoading}
                isLoading={isCancelling}
                onClick={handleCancel}
                size={"sm"}>
                Cancel
              </Button>
            </Box>
          </Flex>
        )
      }
    case InvitationStatus.Canceled:
      if (isAuthUserReceiver) {
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>Receiver canceled invitation {invitation.id}.</Text>
          </Flex>
        )
      } else {
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>You canceled invitation {invitation.id}.</Text>
          </Flex>
        )
      }
    case InvitationStatus.Timeout:
      return (
        <Flex
          direction={"column"}
          gap={2}>
          <Text>Timeout of invitation with id {invitation.id}.</Text>
        </Flex>
      )
    case InvitationStatus.Accepted:
      if (isAuthUserReceiver) {
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>You accepted invitation {invitation.id}</Text>
          </Flex>
        )
      } else {
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>
              User {invitation.receiver.id} accepted invitation {invitation.id}
            </Text>
          </Flex>
        )
      }
    case InvitationStatus.Rejected:
      if (isAuthUserReceiver) {
        return (
          <Flex
            direction={"column"}
            gap={2}>
            <Text>You rejected invitation {invitation.id}</Text>
          </Flex>
        )
      } else {
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
}
