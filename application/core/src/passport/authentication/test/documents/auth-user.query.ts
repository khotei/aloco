import gql from "graphql-tag"

export const authUserQuery = gql`
  query AuthUser {
    authUser {
      id
    }
  }
`
