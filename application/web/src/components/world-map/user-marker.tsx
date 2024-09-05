import { Box, Button, Flex, Text, useDisclosure } from "@chakra-ui/react"
import {
  AdvancedMarker,
  CollisionBehavior,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps"
import { useCallback, useMemo, useState } from "react"

import {
  InvitationStatus,
  type UserFragmentFragment,
} from "@/codegen/__generated__/gql/graphql"
import { useInvitations } from "@/components/invitations-provider"

export function UserMarker({
  authUser,
  location,
  receiver,
}: {
  authUser: UserFragmentFragment
  location: { lat: number; lng: number }
  receiver: UserFragmentFragment
}) {
  const { invitations, sendInvitation } = useInvitations()
  const [isLoading, setIsLoading] = useState(false)
  const isInvited = useMemo(
    () =>
      invitations.findIndex((inv) => inv.receiver.id === receiver.id) !== -1,
    [invitations, receiver.id]
  )
  const handleSend = useCallback(async () => {
    try {
      setIsLoading(true)
      await sendInvitation({
        receiverId: receiver.id,
        status: InvitationStatus.Pending,
      })
    } finally {
      setIsLoading(false)
    }
  }, [sendInvitation, receiver.id])

  const [markerRef, marker] = useAdvancedMarkerRef()
  const { isOpen, onClose, onOpen } = useDisclosure()

  const currentUser = authUser.id === receiver.id

  /**
   * @todo: prevent multiple sending
   *
   * some how you should track updates of invitation.
   *
   * get invitation from initial render. active invitation. delete after timeout.
   * get invitation from subscription(updates). delete on cancel, reject.
   * prevent if there active invitation.
   */

  return (
    <AdvancedMarker
      collisionBehavior={CollisionBehavior.REQUIRED_AND_HIDES_OPTIONAL}
      onClick={onOpen}
      position={location}
      ref={markerRef}>
      {isOpen ? (
        <InfoWindow
          anchor={marker}
          onClose={onClose}>
          <Flex
            direction={"column"}
            gap={2}>
            <Text align={"center"}>{currentUser ? "You" : "Other"}</Text>
            {currentUser ? null : (
              <Box>
                <Button
                  isDisabled={isLoading || isInvited}
                  isLoading={isLoading}
                  onClick={handleSend}
                  size={"sm"}>
                  {isInvited ? "Pending..." : "Invite"}
                </Button>
              </Box>
            )}
          </Flex>
        </InfoWindow>
      ) : (
        <Pin />
      )}
    </AdvancedMarker>
  )
}
