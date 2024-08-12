import { Module } from "@nestjs/common"

import { AuthenticationResolver } from "./authentication/authentication.resolver"

@Module({
  providers: [AuthenticationResolver],
})
export class PassportModule {}
