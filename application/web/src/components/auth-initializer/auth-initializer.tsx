import { Spinner } from "@chakra-ui/react"
import { type ReactNode, useEffect } from "react"

import { useToken } from "@/components/token"
import { useAuthUser } from "@/hooks/auth/use-auth-user"
import { useRegisterTemporalUser } from "@/hooks/auth/use-register-temporal-user"

export function AuthInitializer({ children }: { children: ReactNode }) {
  const [token, setToken] = useToken()
  console.log(token)
  const [register, { data: registerData }] = useRegisterTemporalUser()
  useEffect(() => {
    if (!token) {
      register()
    }
  }, [register, token])
  useEffect(() => {
    const registerToken = registerData?.registerTemporalUser?.token
    if (!token && registerToken) {
      console.log("set token", registerToken)
      setToken(registerToken)
    }
  }, [registerData, setToken, token])

  const { data } = useAuthUser()
  return data?.authUser.user ? children : <Spinner />
}
