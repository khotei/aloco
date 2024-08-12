export type Maybe<T> = null | T
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = {
  [SubKey in K]?: Maybe<T[SubKey]>
} & Omit<T, K>
export type MakeMaybe<T, K extends keyof T> = {
  [SubKey in K]: Maybe<T[SubKey]>
} & Omit<T, K>
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never
    }
  | T
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  Boolean: { input: boolean; output: boolean }
  Float: { input: number; output: number }
  ID: { input: string; output: string }
  Int: { input: number; output: number }
  String: { input: string; output: string }
}

export type Query = {
  __typename?: "Query"
  register: Scalars["String"]["output"]
}
