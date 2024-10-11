import { createUnionType } from "@nestjs/graphql"

import { AcceptedInvitationResponse } from "@/dto/invitations/accepted-invitation-response.dto"
import { InvitationResponse } from "@/dto/invitations/invitation-response.dto"

export const invitationResponseUnion = createUnionType({
  name: "InvitationResponseUnion",
  resolveType: (value) => {
    if ("room" in value) {
      return AcceptedInvitationResponse
    }
    return InvitationResponse
  },
  types: () => [InvitationResponse, AcceptedInvitationResponse] as const,
})
export type InvitationResponseUnion = typeof invitationResponseUnion
