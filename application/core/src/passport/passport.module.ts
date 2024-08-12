import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { PassportModule as NestPassportModule } from "@nestjs/passport"
import { TypeOrmModule } from "@nestjs/typeorm"

import { JwtStrategy } from "@/passport/authentication/strategies/jwt.strategy"
import { User } from "@/users/entities/user.entity"

import { AuthenticationResolver } from "./authentication/authentication.resolver"

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: "secret",
    }),
    NestPassportModule,
  ],
  providers: [AuthenticationResolver, JwtStrategy],
})
export class PassportModule {}
