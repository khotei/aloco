import { Box, useInterval, usePrevious } from "@chakra-ui/react"
import { useGeolocation } from "@uidotdev/usehooks"
import { APIProvider, Map } from "@vis.gl/react-google-maps"
import { useCallback, useEffect, useMemo } from "react"

import { Invitations } from "@/components/invitations"
import { InvitationsProvider } from "@/components/invitations-provider"
import { UserMarker } from "@/components/world-map/user-marker"
import { useAuthUser } from "@/hooks/use-auth-user"
import { useSaveUserLocation } from "@/hooks/use-save-user-location"
import { useUsersLocations } from "@/hooks/use-users-locations"

const GOOGLE_MAPS_API_KEY = "AIzaSyCUZf3em7J8q8WkWOfjJ1B9c5N1aKrDiVI"

export function WorldMap() {
  const { latitude, longitude } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 5_000,
  })
  const [saveLocation, { data }] = useSaveUserLocation()
  const saveCurrentLocation = useCallback(() => {
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
  const prevGeolocation = usePrevious({ latitude, longitude })
  useEffect(() => {
    if (!prevGeolocation?.latitude && !prevGeolocation?.longitude) {
      saveCurrentLocation()
    }
  }, [prevGeolocation, saveCurrentLocation])
  useInterval(() => saveCurrentLocation(), 4000)

  const { data: locationsData } = useUsersLocations({
    pollInterval: 5000,
  })
  const locations = useMemo(
    () =>
      /**
       * @todo: why google map re-create mark each time?
       */
      [
        ...(locationsData?.usersLocations.usersLocations ?? []).filter(
          (location) =>
            location.user.id !== data?.saveUserLocation?.userLocation.user.id
        ),
        data?.saveUserLocation?.userLocation,
      ].filter((location) => location !== undefined),
    [
      data?.saveUserLocation?.userLocation,
      locationsData?.usersLocations?.usersLocations,
    ]
  )
  const { data: authData } = useAuthUser()
  if (!authData) {
    throw new Error("User should be authenticated.")
  }

  return (
    <Box h={"calc(100vh - 40px)"}>
      <InvitationsProvider>
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
            locations.map((ul) => (
              <UserMarker
                authUser={authData.authUser.user}
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
