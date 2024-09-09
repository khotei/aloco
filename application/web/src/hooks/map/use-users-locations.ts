import { useQuery } from "@apollo/client"

import { UsersLocationsDocument } from "@/codegen/__generated__/gql/graphql"

export const useUsersLocations = ({
  pollInterval,
}: { pollInterval?: number } = {}) => {
  return useQuery(UsersLocationsDocument, {
    pollInterval,
  })
}
