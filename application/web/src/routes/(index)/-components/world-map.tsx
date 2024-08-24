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
  type InvitationFragmentFragment,
  InvitationStatus,
  type UserFragmentFragment,
} from "@/codegen/__generated__/gql/graphql"
import { useAuthUser } from "@/hooks/use-auth-user"
import { useSaveUserLocation } from "@/hooks/use-save-user-location"
import { useSendInvitation } from "@/hooks/use-send-invitation"
import { useUsersLocations } from "@/hooks/use-users-locations"

import { Invitation } from "./invitation"

const GOOGLE_MAPS_API_KEY = "AIzaSyCUZf3em7J8q8WkWOfjJ1B9c5N1aKrDiVI"

export function WorldMap() {
  const { latitude, longitude } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 5_000,
  })
  const [saveLocation] = useSaveUserLocation()
  useEffect(() => {
    if (latitude && longitude) {
      /**
       * @todo: re-fetch locations
       */
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

  const { data: locationsData } = useUsersLocations({ pollInterval: 5000 })
  const { data: authData } = useAuthUser()

  const [invitations, setInvitations] = useState<InvitationFragmentFragment[]>(
    []
  )
  const handleInvitation = useCallback(
    (invitation: InvitationFragmentFragment) => {
      setInvitations((prev) => [...prev, invitation])
    },
    [setInvitations]
  )

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
              onInvitation={handleInvitation}
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
  onInvitation,
  user,
}: {
  authUser: UserFragmentFragment
  location: { lat: number; lng: number }
  onInvitation: (invitation: InvitationFragmentFragment) => void
  user: UserFragmentFragment
}) {
  const [send, { loading }] = useSendInvitation()
  const handleSend = useCallback(async () => {
    const { data } = await send({
      variables: {
        input: {
          receiverId: user.id,
          status: InvitationStatus.Pending,
        },
      },
    })
    const invitation = data?.sendInvitation.invitation
    if (invitation) {
      onInvitation(invitation)
    }
  }, [onInvitation, send, user.id])

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
                  isLoading={loading}
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
