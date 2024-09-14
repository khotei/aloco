import { useEffect } from "react"

import { useToken } from "@/components/token"
import { useAuthUser } from "@/hooks/auth/use-auth-user"
import { useRegisterTemporalUser } from "@/hooks/auth/use-register-temporal-user"

export function AuthInitializer() {
  useAuthUser()

  const [token, setToken] = useToken()
  const [register, { data: registerData }] = useRegisterTemporalUser()

  useEffect(() => {
    if (!token) {
      register()
    }
  }, [register, token])
  useEffect(() => {
    const registerToken = registerData?.registerTemporalUser?.token
    if (registerToken) {
      setToken(registerToken)
    }
  }, [registerData, setToken])

  return null
}
