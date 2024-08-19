import {useMutation,} from "@apollo/client";

import {RegisterTemporalUserDocument} from "@/codegen/__generated__/gql/graphql";

export const useRegisterTemporalUser = () => {
  return useMutation(RegisterTemporalUserDocument)
}