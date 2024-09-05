import { Box, Button, Container, Flex } from "@chakra-ui/react"
import { createLazyFileRoute } from "@tanstack/react-router"

import { WorldMap } from "@/components/world-map"

function IndexPage() {
  return (
    <main>
      <Flex as={"header"}>
        <Container maxW={"4xl"}>
          <Flex
            align={"center"}
            justify={"space-between"}
            p={2}>
            <Box>fuckprogramming</Box>
            <Flex gap={3}>
              <Button colorScheme={"yellow"}>sing up</Button>
              <Button variant={"ghost"}>sing in</Button>
            </Flex>
          </Flex>
        </Container>
      </Flex>
      <Box h={"calc(100vh-40px)"}>
        <WorldMap />
      </Box>
    </main>
  )
}

export const Route = createLazyFileRoute("/")({
  component: IndexPage,
})
