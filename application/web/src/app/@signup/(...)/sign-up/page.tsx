'use client'

import {
  Box, Button, HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from "@chakra-ui/react";
import {useRouter} from "next/navigation";

export default function Page() {
  const router = useRouter()

  return (
    <Modal isOpen={true} onClose={() => router.back()}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>sign up</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          form
        </ModalBody>

        <ModalFooter>
          <HStack gap={3}>
            <Button colorScheme='blue' onClick={() => router.back()}>
              close
            </Button>
            <Button variant='ghost'>login</Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}