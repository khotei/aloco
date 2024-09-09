import { type SubscriptionResult, useSubscription } from "@apollo/client"

import {
  InvitationSentDocument,
  InvitationSentSubscription,
} from "@/codegen/__generated__/gql/graphql"

export const useInvitationSub = ({
  onData,
}: {
  onData?: (data: SubscriptionResult<InvitationSentSubscription, any>) => void
} = {}) => {
  return useSubscription(InvitationSentDocument, {
    onData: ({ data }) => onData?.(data),
  })
}
