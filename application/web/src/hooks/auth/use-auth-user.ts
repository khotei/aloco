import { useQuery } from "@apollo/client"

import { AuthUserDocument } from "@/codegen/__generated__/gql/graphql"
import { useToken } from "@/components/token"

export function useAuthUser() {
  const [token, , remove] = useToken()
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
      remove()
    },
    skip: !token,
  })
}

export function useRequireAuthUser() {
  const { data: authData } = useAuthUser()
  const authUser = authData?.authUser.user
  if (!authUser) {
    throw new Error("User should be authenticated.")
  }
  return { authUser }
}
