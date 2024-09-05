import { UseGuards } from "@nestjs/common"
import { Mutation, Query, Resolver } from "@nestjs/graphql"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

import {
  Auth,
  type AuthPayload,
} from "@/authentication/decorators/auth.decorator"
import { AuthResponse } from "@/authentication/dto/auth.dto"
import { TokenResponse } from "@/authentication/dto/token-response.dto"
import { JwtAuthGuard } from "@/authentication/guards/jwt-auth.guard"
import type { JwtPayload } from "@/authentication/strategies/jwt.strategy"
import { User } from "@/entities/user.entity"

@Resolver()
export class AuthenticationResolver {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService
  ) {}
  @Mutation(() => TokenResponse, { name: "registerTemporalUser" })
  async createTemporalUser(): Promise<TokenResponse> {
    const user = await this.usersRepo.save(this.usersRepo.create())

    const jwtPayload: JwtPayload = { sub: user.id }
    const token = await this.jwtService.signAsync(jwtPayload, {
      secret: "secret",
    })
    return { token }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => AuthResponse, { name: "authUser" })
  async getAuthUser(@Auth() auth: AuthPayload): Promise<AuthResponse> {
    const user = await this.usersRepo.findOneByOrFail({ id: auth.userId })
    return { user }
  }
}
