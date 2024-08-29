import { useSubscription } from "@apollo/client"

import { InvitationSentDocument } from "@/codegen/__generated__/gql/graphql"

export const useInvitationSub = () => {
  return useSubscription(InvitationSentDocument, {
    onData: console.log,
  })
}
