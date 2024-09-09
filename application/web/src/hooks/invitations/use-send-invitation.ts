import { useMutation } from "@apollo/client"

import { SendInvitationDocument } from "@/codegen/__generated__/gql/graphql"

export const useSendInvitation = () => {
  return useMutation(SendInvitationDocument)
}
