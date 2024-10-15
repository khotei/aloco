import { Box } from "@chakra-ui/react"
import { APIProvider, Map } from "@vis.gl/react-google-maps"
import { useEffect, useMemo } from "react"
import { useGeolocation, useInterval } from "react-use"

import { Invitations } from "@/components/invitations"
import { InvitationsProvider } from "@/components/invitations-provider"
import { UserMarker } from "@/components/world-map/user-marker"
import { useRequireAuthUser } from "@/hooks/auth/use-auth-user"
import { useSaveUserLocation } from "@/hooks/map/use-save-user-location"
import { useUsersLocations } from "@/hooks/map/use-users-locations"

export function WorldMap() {
  const { locations, userLocation } = useActiveLocations()
  const defaultCenter = useMemo(
    () => ({
      /**
       * @todo: make one time reset center, when user get his location
       */
      lat: userLocation?.location.lat ?? 50.3907625,
      lng: userLocation?.location.lng ?? 30.635667999999995,
    }),
    [userLocation]
  )

  const { authUser } = useRequireAuthUser()

  return (
    <Box h={"100vh"}>
      <InvitationsProvider>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={14}
            mapId={"worldMap"}
          />
          {authUser &&
            locations.map((ul) => (
              <UserMarker
                currentUser={authUser.id === ul.user.id}
                key={ul.id}
                location={ul.location}
                receiver={ul.user}
              />
            ))}
        </APIProvider>
        <Invitations />
      </InvitationsProvider>
    </Box>
  )
}

function useActiveLocations() {
  const { userLocation } = useUserLocation()
  const { data } = useUsersLocations({
    pollInterval: 5000,
  })
  return useMemo(
    () => ({
      locations: [
        ...(data?.usersLocations.usersLocations.filter(
          (location) => location.user.id !== userLocation?.user.id
        ) ?? []),
        ...(userLocation ? [userLocation] : []),
      ],
      userLocation,
    }),
    [data?.usersLocations.usersLocations, userLocation]
  )
}

function useUserLocation() {
  /**
   * @todo: notify user about error
   */
  const geo = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 4_000,
  })
  const [saveLocation, { data: saveUserLocationData }] = useSaveUserLocation()
  const location = useMemo(
    () =>
      !geo.longitude || !geo.latitude
        ? null
        : { lat: geo.latitude, lng: geo.longitude },
    [geo.latitude, geo.longitude]
  )
  const saveUserLocation = () => {
    if (location) {
      saveLocation({
        variables: {
          input: {
            location,
          },
        },
      })
    }
  }

  useInterval(saveUserLocation, 4_000)
  useEffect(saveUserLocation, [location, saveLocation])

  return { userLocation: saveUserLocationData?.saveUserLocation.userLocation }
}
