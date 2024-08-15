'use client'

import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps'
import { useGeolocation } from "@uidotdev/usehooks";
import {Box} from "@chakra-ui/react";

const API_KEY = 'AIzaSyCUZf3em7J8q8WkWOfjJ1B9c5N1aKrDiVI'

export function WorldMap() {
  const {error, loading, latitude , longitude   } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 5_000
  });

  return (
    <Box h={'calc(100vh - 40px)'}>
      <APIProvider apiKey={API_KEY}><GoogleMap
        defaultCenter={{lat: latitude ?? 50.3907625, lng: 30.635667999999995}}
        defaultZoom={14}
      />
      </APIProvider>
    </Box>
  )
}