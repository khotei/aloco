import {Header} from "@/app/header";
import {WorldMap} from "./world-map";
import {apolloClient} from "@/core/create-apollo";
import {
  AuthUserDocument,
  type AuthUserQuery,
  RegisterTemporalUserDocument,
  type RegisterTemporalUserMutation
} from "@/__generated__/graphql";
import {cookies} from "next/headers";

export default async function Home() {
  const token = cookies().get('token')?.value ?? (await apolloClient.query<RegisterTemporalUserMutation>({query: RegisterTemporalUserDocument})).data?.registerTemporalUser.token
  if (token) {
    await apolloClient.query<AuthUserQuery>({
      query: AuthUserDocument, context: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })
  }

  return (
    <main>
      <Header />
        <WorldMap />
    </main>
  );
}
