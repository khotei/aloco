import { Box, useInterval, usePrevious } from "@chakra-ui/react"
import { useGeolocation } from "@uidotdev/usehooks"
import { APIProvider, Map } from "@vis.gl/react-google-maps"
import { useCallback, useEffect, useMemo } from "react"

import type { UserLocationFragmentFragment } from "@/codegen/__generated__/gql/graphql"
import { Invitations } from "@/components/invitations"
import { InvitationsProvider } from "@/components/invitations-provider"
import { UserMarker } from "@/components/world-map/user-marker"
import { useAuthUser } from "@/hooks/auth/use-auth-user"
import { useSaveUserLocation } from "@/hooks/map/use-save-user-location"
import { useUsersLocations } from "@/hooks/map/use-users-locations"

export function WorldMap() {
  const geo = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 5_000,
  })
  const location = useMemo(
    () =>
      !geo.longitude || !geo.latitude
        ? null
        : { lat: geo.latitude, lng: geo.longitude },
    [geo.latitude, geo.longitude]
  )
  const prevGeolocation = usePrevious(location)
  console.log({ geo, prevGeolocation })
  const [saveLocation, { data: saveUserLocationData }] = useSaveUserLocation()
  const saveCurrentLocation = useCallback(() => {
    if (location) {
      saveLocation({
        variables: {
          input: {
            location,
          },
        },
      })
    }
  }, [location, saveLocation])
  useEffect(() => {
    if (
      !prevGeolocation?.lat &&
      !prevGeolocation?.lng &&
      location?.lat &&
      location?.lng
    ) {
      saveCurrentLocation()
    }
  }, [
    location?.lat,
    location?.lng,
    prevGeolocation?.lat,
    prevGeolocation?.lng,
    saveCurrentLocation,
  ])
  useInterval(() => saveCurrentLocation(), 4000)

  const { data: locationsData } = useUsersLocations({
    pollInterval: 5000,
  })
  const locations = useMemo(
    () =>
      mergeLocationsWithCurrentUserLocation({
        currentUserLocation:
          saveUserLocationData?.saveUserLocation.userLocation,
        locations: locationsData?.usersLocations.usersLocations,
      }),
    [
      locationsData?.usersLocations.usersLocations,
      saveUserLocationData?.saveUserLocation.userLocation,
    ]
  )

  const { data: authData } = useAuthUser()
  const authUser = authData?.authUser.user
  if (!authUser) {
    throw new Error("User should be authenticated.")
  }

  return (
    <Box h={"100vh"}>
      <InvitationsProvider>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={{
              /**
               * @todo: make one time reset center, when user get his location
               */
              lat: location?.lat ?? 50.3907625,
              lng: location?.lng ?? 30.635667999999995,
            }}
            defaultZoom={14}
            mapId={"worldMap"}
          />
          {authData &&
            locations.map((ul) => (
              <UserMarker
                authUser={authUser}
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

function mergeLocationsWithCurrentUserLocation({
  currentUserLocation,
  locations = [],
}: {
  currentUserLocation?: UserLocationFragmentFragment
  locations?: UserLocationFragmentFragment[]
}) {
  const mergedLocations = locations.map((location) => {
    if (
      currentUserLocation &&
      location.user.id === currentUserLocation.user.id
    ) {
      return currentUserLocation
    }
    return location
  })
  return mergedLocations
}
