import { Box } from "@chakra-ui/react"
import { APIProvider, Map } from "@vis.gl/react-google-maps"
import { useCallback, useEffect, useMemo } from "react"

import type { UserLocationFragmentFragment } from "@/codegen/__generated__/gql/graphql"
import { Invitations } from "@/components/invitations"
import { InvitationsProvider } from "@/components/invitations-provider"
import { UserMarker } from "@/components/world-map/user-marker"
import { useRequireAuthUser } from "@/hooks/auth/use-auth-user"
import { useGeo } from "@/hooks/common/use-geo"
import { useSaveUserLocation } from "@/hooks/map/use-save-user-location"
import { useUsersLocations } from "@/hooks/map/use-users-locations"

export function WorldMap() {
  const { userLocation } = useUserLocation()
  const locations = useActiveLocations({
    currentUserLocation: userLocation,
  })

  const { authUser } = useRequireAuthUser()

  return (
    <Box h={"100vh"}>
      <InvitationsProvider>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={{
              /**
               * @todo: make one time reset center, when user get his location
               */
              lat: userLocation?.location.lat ?? 50.3907625,
              lng: userLocation?.location.lng ?? 30.635667999999995,
            }}
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

function useActiveLocations({
  currentUserLocation,
}: {
  currentUserLocation: null | undefined | UserLocationFragmentFragment
}) {
  const { data: locationsData } = useUsersLocations({
    pollInterval: 5000,
  })
  const locations = useMemo(
    () =>
      (
        locationsData?.usersLocations.usersLocations.filter(
          (location) => location.user.id !== currentUserLocation?.user.id
        ) ?? []
      ).concat(currentUserLocation ? [currentUserLocation] : []),
    [locationsData?.usersLocations.usersLocations, currentUserLocation]
  )
  return locations
}

function useUserLocation() {
  /**
   * @todo: notify user about error
   */
  const geo = useGeo({
    enableHighAccuracy: true,
    maximumAge: 4_000,
  })
  const location = useMemo(
    () =>
      !geo.longitude || !geo.latitude
        ? null
        : { lat: geo.latitude, lng: geo.longitude },
    [geo.latitude, geo.longitude]
  )
  const [saveLocation, { data: saveUserLocationData }] = useSaveUserLocation()
  const saveUserLocation = useCallback(async () => {
    if (location) {
      await saveLocation({
        variables: {
          input: {
            location,
          },
        },
      })
    }
  }, [location, saveLocation])
  useEffect(() => {
    saveUserLocation()
    const intervalId = setInterval(saveUserLocation, 4_000)

    return () => {
      clearInterval(intervalId)
    }
  }, [location, saveUserLocation])
  return { userLocation: saveUserLocationData?.saveUserLocation.userLocation }
}
