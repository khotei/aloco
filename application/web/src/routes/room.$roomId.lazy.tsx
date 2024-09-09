import { createLazyFileRoute } from "@tanstack/react-router"

import { Room } from "@/components/room"

function RoomPage() {
  return <Room />
}

export const Route = createLazyFileRoute("/room/$roomId")({
  component: RoomPage,
})
