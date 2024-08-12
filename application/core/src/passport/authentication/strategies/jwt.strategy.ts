import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

import type { JwtPayloadInterface } from "../decorators/jwt-payload.decorator"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "secret",
    })
  }

  async validate(payload: JwtPayloadInterface) {
    return { email: payload.email, userId: payload.sub }
  }
}
