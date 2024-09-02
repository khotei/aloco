import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/room/$roomId")({
  component: () => <main>Room</main>,
})
