import { Box, Button, Container, Flex, useDisclosure } from "@chakra-ui/react"
import { createLazyFileRoute } from "@tanstack/react-router"
import { useGeolocation } from "@uidotdev/usehooks"
import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps"
import { useEffect } from "react"

import type { UserFragmentFragment } from "@/codegen/__generated__/gql/graphql"
import { useAuthUser } from "@/hooks/use-auth-user"
import { useSaveUserLocation } from "@/hooks/use-save-user-location"
import { useUsersLocations } from "@/hooks/use-users-locations"

const GOOGLE_MAPS_API_KEY = "AIzaSyCUZf3em7J8q8WkWOfjJ1B9c5N1aKrDiVI"

export const Route = createLazyFileRoute("/")({
  component: () => (
    <main>
      <Flex as={"header"}>
        <Container maxW={"4xl"}>
          <Flex
            align={"center"}
            justify={"space-between"}
            p={2}>
            <Box>fuckprogramming</Box>
            <Flex gap={3}>
              <Button colorScheme={"yellow"}>sing up</Button>
              <Button variant={"ghost"}>sing in</Button>
            </Flex>
          </Flex>
        </Container>
      </Flex>
      <Box h={"calc(100vh-40px)"}>
        <WorldMap />
      </Box>
    </main>
  ),
})

function WorldMap() {
  const { latitude, longitude } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 5_000,
  })

  const [saveLocation] = useSaveUserLocation()
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

  const { data: locationsData } = useUsersLocations({ pollInterval: 5000 })
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
              location={{ lat: ul.location[1], lng: ul.location[0] }}
              user={ul.user}
            />
          ))}
      </APIProvider>
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
  const [markerRef, marker] = useAdvancedMarkerRef()
  const { isOpen, onClose, onOpen } = useDisclosure()

  return (
    <AdvancedMarker
      onClick={onOpen}
      position={location}
      ref={markerRef}>
      {isOpen ? (
        <InfoWindow
          anchor={marker}
          onClose={onClose}>
          {authUser.id === user.id ? "You" : "Other"}
        </InfoWindow>
      ) : (
        <Pin />
      )}
    </AdvancedMarker>
  )
}
