import { useQuery } from "@apollo/client"

import { AuthUserDocument } from "@/codegen/__generated__/gql/graphql"
import { useToken } from "@/components/token"

export const useAuthUser = () => {
  const [token, setToken] = useToken()
  return useQuery(AuthUserDocument, {
    onError: () => {
      /**
       * @todo: check if user re-registered after clear token
       * create new user, and set token again
       * or just refresh page.
       *
       * also what if user in future was not a guest,
       * but the token expire... should he be notified, and become guest
       */
      setToken(null)
    },
    skip: !token,
  })
}
