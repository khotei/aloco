import { useMutation } from "@apollo/client"
import type { SaveUserLocationMutation } from "core/dist/__generated__/scheme.generated"

import { SaveUserLocationDocument } from "@/codegen/__generated__/gql/graphql"

export const useSaveUserLocation = ({
  onCompleted,
}: { onCompleted?: (data: SaveUserLocationMutation) => void } = {}) => {
  return useMutation(SaveUserLocationDocument, { onCompleted })
}
