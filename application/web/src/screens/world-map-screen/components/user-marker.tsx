import { Box, Button, Flex, Text, useDisclosure } from "@chakra-ui/react"
import {
  AdvancedMarker,
  CollisionBehavior,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps"
import { useMemo } from "react"
import { useAsyncFn } from "react-use"

import {
  InvitationStatus,
  type UserFragmentFragment,
} from "@/codegen/__generated__/gql/graphql"
import { useInvitations } from "@/providers/invitations-provider"

export const UserMarker = function UserMarker({
  currentUser,
  location,
  receiver,
}: {
  currentUser: boolean
  location: { lat: number; lng: number }
  receiver: UserFragmentFragment
}) {
  const { invitations, sendInvitation } = useInvitations()
  const isInvited = useMemo(
    () =>
      invitations.findIndex((inv) => inv.receiver.id === receiver.id) !== -1,
    [invitations, receiver.id]
  )
  const [{ loading }, handleSend] = useAsyncFn(
    () =>
      sendInvitation({
        receiverId: receiver.id,
        status: InvitationStatus.Pending,
      }),
    [sendInvitation, receiver.id]
  )

  const [markerRef, marker] = useAdvancedMarkerRef()
  const { isOpen, onClose, onOpen } = useDisclosure()

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
                  isDisabled={loading || isInvited}
                  isLoading={loading}
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
