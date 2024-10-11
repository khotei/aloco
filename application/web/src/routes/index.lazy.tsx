import { createLazyFileRoute } from "@tanstack/react-router"

import { WorldMap } from "@/components/world-map"

function IndexPage() {
  return (
    <main>
      <WorldMap />
    </main>
  )
}

export const Route = createLazyFileRoute("/")({
  component: IndexPage,
})
