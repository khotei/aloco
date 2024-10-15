import { Spinner } from "@chakra-ui/react"
import { type ReactNode, useEffect } from "react"

import { useAuthUser } from "@/hooks/auth/use-auth-user"
import { useRegisterTemporalUser } from "@/hooks/auth/use-register-temporal-user"
import { useToken } from "@/providers/token-provider"

export function AuthInitializer({ children }: { children: ReactNode }) {
  const [token, setToken] = useToken()
  const [register, { data: registerData }] = useRegisterTemporalUser()
  useEffect(() => {
    if (!token) {
      register()
    }
  }, [register, token])
  useEffect(() => {
    const registerToken = registerData?.registerTemporalUser?.token
    if (!token && registerToken) {
      setToken(registerToken)
    }
  }, [registerData, setToken, token])

  const { data } = useAuthUser()
  return data?.authUser.user ? children : <Spinner />
}
