import { UseGuards } from "@nestjs/common"
import { Mutation, Query, Resolver } from "@nestjs/graphql"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

import { AuthResponse } from "@/passport/authentication/dto/auth.dto"
import type { JwtPayload } from "@/passport/authentication/strategies/jwt.strategy"
import { User } from "@/users/entities/user.entity"

import { Auth, type AuthPayload } from "../decorators/auth.decorator"
import { TokenResponse } from "../dto/token-response.dto"
import { JwtAuthGuard } from "../guards/jwt-auth.guard"

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
  async getAuthUser(@Auth() auth: AuthPayload): Promise<{ user: User }> {
    const user = await this.usersRepo.findOneByOrFail({ id: auth.userId })
    return { user }
  }
}
