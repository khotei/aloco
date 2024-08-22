import { useEffect } from "react"

import { useToken } from "@/components/token"
import { useAuthUser } from "@/hooks/use-auth-user"
import { useRegisterTemporalUser } from "@/hooks/use-register-temporal-user"

export function AuthInitializer() {
  useAuthUser()

  const [token, setToken] = useToken()
  const [register, { data: registerData }] = useRegisterTemporalUser()
  const registerToken = registerData?.registerTemporalUser?.token

  useEffect(() => {
    if (!token) {
      register()
    }
  }, [register, token])

  useEffect(() => {
    if (registerToken) {
      setToken(registerToken)
    }
  }, [registerToken, setToken])

  return null
}
