'use client'

import { APIProvider, Map as GoogleMap } from '@vis.gl/react-google-maps'
import { useGeolocation } from "@uidotdev/usehooks";
import {Box, } from "@chakra-ui/react";
import {useAuthUserQuery, useRegisterTemporalUserMutation} from "@/__generated__/graphql";
import {apolloClient} from "@/core/create-apollo";
import {useEffect} from "react";
import {useCookie} from "@/core/use-cookie";

const API_KEY = 'AIzaSyCUZf3em7J8q8WkWOfjJ1B9c5N1aKrDiVI'

export function WorldMap() {
  const { latitude , longitude   } = useGeolocation({
    enableHighAccuracy: true,
    maximumAge: 5_000
  });

  const [token, setToken] = useCookie("token", null);
  const {data: authData} = useAuthUserQuery({
    skip: !token,
    client: apolloClient,
    context: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
  const [mutate, {data: registerData}] = useRegisterTemporalUserMutation({
    client: apolloClient,
    onCompleted: (data) => {
      // @ts-ignore
      setToken(data?.registerTemporalUser?.token)
    },
  })

  useEffect(() => {
    if (!token) {
      mutate()
    }
  }, [registerData, mutate, setToken, token])

  if (!authData?.authUser) {
    return null
  }

  return (
    <Box h={'calc(100vh - 40px)'}>
      <APIProvider apiKey={API_KEY}><GoogleMap
        defaultCenter={{lat: latitude ?? 50.3907625, lng: longitude ?? 30.635667999999995}}
        defaultZoom={14}
      />
      </APIProvider>
    </Box>
  )
}