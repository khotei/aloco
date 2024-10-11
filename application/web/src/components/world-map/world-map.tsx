import { Box } from "@chakra-ui/react"
import { useGeolocation } from "@uidotdev/usehooks"
import { APIProvider, Map } from "@vis.gl/react-google-maps"
import { useEffect, useMemo } from "react"

import { Invitations } from "@/components/invitations"
import { InvitationsProvider } from "@/components/invitations-provider"
import { UserMarker } from "@/components/world-map/user-marker"
import { useAuthUser } from "@/hooks/auth/use-auth-user"
import { useSaveUserLocation } from "@/hooks/map/use-save-user-location"
import { useUsersLocations } from "@/hooks/map/use-users-locations"

export function WorldMap() {
  const { data: authData } = useAuthUser()
  const authUser = authData?.authUser.user
  if (!authUser) {
    throw new Error("User should be authenticated.")
  }

  const location = useLocation()
  const [saveLocation, { data: saveUserLocationData }] = useSaveUserLocation()
  useEffect(() => {
    save()
    const intervalId = setInterval(save, 4_000)

    function save() {
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
    return () => {
      clearInterval(intervalId)
    }
  }, [location, saveLocation])

  const { data: locationsData } = useUsersLocations({
    pollInterval: 5000,
  })
  const locations = useMemo(
    () =>
      (
        locationsData?.usersLocations.usersLocations.filter(
          (location) =>
            location.user.id ===
            saveUserLocationData?.saveUserLocation.userLocation.user.id
        ) ?? []
      ).concat(
        saveUserLocationData?.saveUserLocation.userLocation
          ? [saveUserLocationData?.saveUserLocation.userLocation]
          : []
      ),
    [
      locationsData?.usersLocations.usersLocations,
      saveUserLocationData?.saveUserLocation.userLocation,
    ]
  )

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

function useLocation() {
  /**
   * @todo: notify user about error
   */
  const geo = useGeolocation({
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
  return location
}
