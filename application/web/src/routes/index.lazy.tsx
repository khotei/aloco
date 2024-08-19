import {Box, Button, Container, Flex, useDisclosure} from "@chakra-ui/react";
import { createLazyFileRoute } from '@tanstack/react-router'
import { useGeolocation } from '@uidotdev/usehooks';
import {AdvancedMarker, APIProvider, InfoWindow, Map, Pin, useAdvancedMarkerRef} from '@vis.gl/react-google-maps';
import {type ReactNode} from "react";

import type {User} from "@/codegen/__generated__/gql/graphql";

const GOOGLE_MAPS_API_KEY = 'AIzaSyCUZf3em7J8q8WkWOfjJ1B9c5N1aKrDiVI'

export const Route = createLazyFileRoute('/')({
  component: () => <main>
    <Flex as={'header'}>
      <Container maxW={'4xl'}>
        <Flex align={'center'}  justify={'space-between'} p={2}>
          <Box>
            fuckprogramming
          </Box>
          <Flex gap={3}>
            <Button colorScheme={'yellow'}>
              sing up
            </Button>
            <Button variant={'ghost'}>
              sing in
            </Button>
          </Flex>
        </Flex>
      </Container>
    </Flex>
    <Box h={'calc(100vh-40px)'}>
      <WorldMap />
    </Box>
  </main>
})


 function WorldMap({markers}: {markers?: ReactNode[]}) {
  const { latitude , longitude   } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 5_000
  });
  //
  // const [token] = useCookie('token')
  // const [saveLocation, {data}] = useSaveUserLocationMutation({client: apolloClient, context: {
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   }})
  //
  // console.log(data);
  // useEffect(() => {
  //   saveLocation({variables: {input: {location: {lng: longitude, lat: latitude}} }})
  // }, [latitude, longitude, saveLocation])
  //

  return (
    <Box h={'calc(100vh - 40px)'}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}><Map
        defaultCenter={{lat: latitude ?? 50.3907625, lng: longitude ?? 30.635667999999995}}
        defaultZoom={14}
        mapId={'worldMap'}
      />
        {markers}
      </APIProvider>
    </Box>
  )
}

export function UserMarker({authUser, location, user}: {authUser: User, location: {lat: number, lng: number}, user: User}) {
  const [markerRef, marker] = useAdvancedMarkerRef()
  const { isOpen, onClose, onOpen } = useDisclosure()

  return (
    <AdvancedMarker
      onClick={onOpen}
      position={location}
      ref={markerRef}
    >
      {isOpen ? (
        <InfoWindow
          anchor={marker}
          onClose={onClose}
        >
          {authUser.id === user.id ? 'You' : 'Other'}
        </InfoWindow>
      ) : (
        <Pin />
      )}
    </AdvancedMarker>
  )
}