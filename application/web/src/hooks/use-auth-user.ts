import { useQuery } from "@apollo/client"

import { AuthUserDocument } from "@/codegen/__generated__/gql/graphql"
import { useToken } from "@/components/token"

export const useAuthUser = () => {
  const [token] = useToken()
  return useQuery(AuthUserDocument, { skip: !token })
}
