import { createStandaloneToast } from "@chakra-ui/react"

export const { toast, ToastContainer } = createStandaloneToast({
  defaultOptions: {
    duration: null,
    position: "bottom-right",
    title: "Invitation.",
  },
})
