import gql from "graphql-tag"

export const saveUserLocationMutation = gql`
  mutation SaveUserLocation($input: SaveUserLocationInput!) {
    saveUserLocation(saveUserLocationInput: $input) {
      id
      user {
        id
      }
      location
    }
  }
`
