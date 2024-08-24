import { Box, Button, Flex, Text, useDisclosure } from "@chakra-ui/react"
import { useGeolocation } from "@uidotdev/usehooks"
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps"
import { useCallback, useEffect, useState } from "react"

import {
  InvitationStatus,
  type UserFragmentFragment,
} from "@/codegen/__generated__/gql/graphql"
import { useAuthUser } from "@/hooks/use-auth-user"
import { useSaveUserLocation } from "@/hooks/use-save-user-location"
import { useUsersLocations } from "@/hooks/use-users-locations"
import { useInvitations } from "@/routes/(index)/-components/invitations-provider"

import { Invitation } from "./invitation"

const GOOGLE_MAPS_API_KEY = "AIzaSyCUZf3em7J8q8WkWOfjJ1B9c5N1aKrDiVI"

export function WorldMap() {
  const { data: locationsData, refetch } = useUsersLocations({
    pollInterval: 5000,
  })
  const { latitude, longitude } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 5_000,
  })
  const [saveLocation] = useSaveUserLocation({ onCompleted: () => refetch() })
  useEffect(() => {
    if (latitude && longitude) {
      saveLocation({
        variables: {
          input: {
            location: {
              lat: latitude,
              lng: longitude,
            },
          },
        },
      })
    }
  }, [saveLocation, latitude, longitude])

  const { invitations } = useInvitations()

  const { data: authData } = useAuthUser()

  return (
    <Box h={"calc(100vh - 40px)"}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={{
            lat: latitude ?? 50.3907625,
            lng: longitude ?? 30.635667999999995,
          }}
          defaultZoom={14}
          mapId={"worldMap"}
        />
        {authData &&
          locationsData?.usersLocations.usersLocations.map((ul) => (
            <UserMarker
              authUser={authData?.authUser.user}
              key={ul.id}
              location={{ lat: ul.location[0], lng: ul.location[1] }}
              user={ul.user}
            />
          ))}
      </APIProvider>
      {invitations.map((inv) => (
        <Invitation
          invitation={inv}
          key={inv.id}
        />
      ))}
    </Box>
  )
}
export function UserMarker({
  authUser,
  location,
  user,
}: {
  authUser: UserFragmentFragment
  location: { lat: number; lng: number }
  user: UserFragmentFragment
}) {
  const { sendInvitation } = useInvitations()
  const [isLoading, setIsLoading] = useState(false)
  const handleSend = useCallback(async () => {
    try {
      setIsLoading(true)
      await sendInvitation({
        receiverId: user.id,
        status: InvitationStatus.Pending,
      })
    } finally {
      setIsLoading(false)
    }
  }, [sendInvitation, user.id])

  const [markerRef, marker] = useAdvancedMarkerRef()
  const { isOpen, onClose, onOpen } = useDisclosure()

  const currentUser = authUser.id === user.id

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
      onClick={onOpen}
      position={location}
      ref={markerRef}>
      {isOpen ? (
        <InfoWindow
          anchor={marker}
          onClose={onClose}>
          <Flex direction={"column"}>
            <Text>{currentUser ? "You" : "Other"}</Text>
            {currentUser ? null : (
              <Box>
                <Button
                  isLoading={isLoading}
                  onClick={handleSend}>
                  Invite
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
