import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { TypeOrmModule } from "@nestjs/typeorm"

import {
  AuthenticationResolver,
  User,
} from "./authentication/authentication.resolver"

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: "secret",
    }),
  ],
  providers: [AuthenticationResolver],
})
export class PassportModule {}
