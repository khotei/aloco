import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"

import type { AuthPayload } from "@/api/authentication/decorators/auth.decorator"

export interface JwtPayload {
  userId: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      /**
       * @todo: maybe there a way to split strategies
       * and use different with guard
       */
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const isSub = Boolean(req.subscriptions)
          if (isSub) {
            return req.connectionParams?.Authorization.split(" ").at(1)
          } else {
            return req.headers?.authorization?.split(" ").at(1)
          }
        },
      ]),
      secretOrKey: "secret",
    })
  }

  async validate(payload: JwtPayload): Promise<AuthPayload> {
    return payload
  }
}
