import gql from "graphql-tag"

export const registerTemporalUserMutation = gql`
  mutation RegisterTemporalUser {
    registerTemporalUser {
      token
    }
  }
`
