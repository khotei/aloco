import { useMutation } from "@apollo/client"

import { SaveUserLocationDocument } from "@/codegen/__generated__/gql/graphql"

export const useSaveUserLocation = () => {
  return useMutation(SaveUserLocationDocument)
}
