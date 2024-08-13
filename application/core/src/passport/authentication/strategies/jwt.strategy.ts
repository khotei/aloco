import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

import type { AuthPayload } from "@/passport/authentication/decorators/auth.decorator"

export interface JwtPayload {
  email?: string
  sub: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "secret",
    })
  }

  async validate(payload: JwtPayload): Promise<AuthPayload> {
    return { userId: payload.sub }
  }
}
