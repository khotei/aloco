import { useMutation } from "@apollo/client"

import { CreateStreamTokenDocument } from "@/codegen/__generated__/gql/graphql"

export const useCreateStreamToken = () => {
  return useMutation(CreateStreamTokenDocument)
}
