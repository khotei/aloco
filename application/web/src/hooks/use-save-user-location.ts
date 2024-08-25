import { useMutation } from "@apollo/client"

import {
  SaveUserLocationDocument,
  type SaveUserLocationMutation,
} from "@/codegen/__generated__/gql/graphql"

export const useSaveUserLocation = ({
  onCompleted,
}: { onCompleted?: (data: SaveUserLocationMutation) => void } = {}) => {
  return useMutation(SaveUserLocationDocument, { onCompleted })
}
