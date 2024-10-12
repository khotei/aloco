import { useEffect, useRef, useState } from "react"

type PositionOptions = {
  enableHighAccuracy?: boolean
  maximumAge?: number
  timeout?: number
}

type GeolocationState = {
  accuracy: null | number
  altitude: null | number
  altitudeAccuracy: null | number
  error: GeolocationPositionError | null
  heading: null | number
  latitude: null | number
  loading: boolean
  longitude: null | number
  speed: null | number
  timestamp: null | number
}

type GeolocationPositionError = {
  readonly code: number
  readonly message: string
  readonly PERMISSION_DENIED: 1
  readonly POSITION_UNAVAILABLE: 2
  readonly TIMEOUT: 3
}

export function useGeo(options: PositionOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    error: null,
    heading: null,
    latitude: null,
    loading: true,
    longitude: null,
    speed: null,
    timestamp: null,
  })

  const optionsRef = useRef(options)

  useEffect(() => {
    const onEvent = ({ coords, timestamp }: GeolocationPosition) => {
      setState({
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        error: null,
        heading: coords.heading,
        latitude: coords.latitude,
        loading: false,
        longitude: coords.longitude,
        speed: coords.speed,
        timestamp,
      })
    }

    const onEventError = (error: GeolocationPositionError) => {
      setState((s) => ({
        ...s,
        error,
        loading: false,
      }))
    }

    navigator.geolocation.getCurrentPosition(
      onEvent,
      onEventError,
      optionsRef.current
    )

    const watchId = navigator.geolocation.watchPosition(
      onEvent,
      onEventError,
      optionsRef.current
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return state
}
