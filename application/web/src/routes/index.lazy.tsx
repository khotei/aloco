import { createLazyFileRoute } from "@tanstack/react-router"

import { WorldMapScreen } from "@/screens/world-map-screen"

function IndexPage() {
  return (
    <main>
      <WorldMapScreen />
    </main>
  )
}

export const Route = createLazyFileRoute("/")({
  component: IndexPage,
})
