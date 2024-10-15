import { createLazyFileRoute } from "@tanstack/react-router"

import { RoomScreen } from "@/screens/room-screen"

function RoomPage() {
  return (
    <main>
      <RoomScreen />
    </main>
  )
}

export const Route = createLazyFileRoute("/room/$roomId")({
  component: RoomPage,
})
