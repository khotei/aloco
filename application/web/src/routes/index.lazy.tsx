import { createLazyFileRoute } from '@tanstack/react-router'
import {Box, Button, Container, Flex, useDisclosure} from "@chakra-ui/react";
import {type ReactNode} from "react";
import {APIProvider, Map, AdvancedMarker, useAdvancedMarkerRef, InfoWindow, Pin} from '@vis.gl/react-google-maps';
import { useGeolocation } from '@uidotdev/usehooks';
import type {User} from "../codegen/__generated__/graphql";

const GOOGLE_MAPS_API_KEY = 'AIzaSyCUZf3em7J8q8WkWOfjJ1B9c5N1aKrDiVI'

export const Route = createLazyFileRoute('/')({
  component: () => <main>
    <Flex as={'header'}>
      <Container maxW={'4xl'}>
        <Flex justify={'space-between'}  p={2} align={'center'}>
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
        mapId={'worldMap'}
        defaultCenter={{lat: latitude ?? 50.3907625, lng: longitude ?? 30.635667999999995}}
        defaultZoom={14}
      />
        {markers}
      </APIProvider>
    </Box>
  )
}

export function UserMarker({location}: {location: {lng: number, lat: number}, user: User, authUser: User}) {
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
          {true ? 'You' : 'Other'}
        </InfoWindow>
      ) : (
        <Pin />
      )}
    </AdvancedMarker>
  )
}