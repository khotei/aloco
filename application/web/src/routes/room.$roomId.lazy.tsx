import { createLazyFileRoute } from "@tanstack/react-router"

import { Room } from "@/components/room"

function RoomPage() {
  return (
    <main>
      <Room />
    </main>
  )
}

export const Route = createLazyFileRoute("/room/$roomId")({
  component: RoomPage,
})
