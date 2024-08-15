import {Box, Container, Flex, HStack} from "@chakra-ui/react";
import Link from "next/link";

export function Header() {
  return (
    <Box as={'header'} bg={'blue.800'}>
      <Container maxW={'5xl'}>
        <Flex color={'purple.100'} h={10} justifyContent={'space-between'} alignItems={'center'}>
          <Box >
            <Link href={'/'}>fckprogramming</Link>
          </Box>
          <HStack gap={3}>
            <Link href={'/sign-up'}>sign up</Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}