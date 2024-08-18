import { UseGuards } from "@nestjs/common"
import { Mutation, Query, Resolver } from "@nestjs/graphql"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

import { AuthDto } from "@/passport/authentication/dto/auth.dto"
import type { JwtPayload } from "@/passport/authentication/strategies/jwt.strategy"
import { User } from "@/users/entities/user.entity"

import { Auth, type AuthPayload } from "../decorators/auth.decorator"
import { TokenResponseDto } from "../dto/token-response.dto"
import { JwtAuthGuard } from "../guards/jwt-auth.guard"

@Resolver()
export class AuthenticationResolver {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService
  ) {}
  @Mutation(() => TokenResponseDto, { name: "registerTemporalUser" })
  async createTemporalUser(): Promise<TokenResponseDto> {
    const user = await this.usersRepo.save(this.usersRepo.create())
    const token = await this.jwtService.signAsync(
      { sub: user.id } as JwtPayload,
      {
        secret: "secret",
      }
    )
    return { token }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => AuthDto, { name: "authUser" })
  async getAuthUser(@Auth() auth: AuthPayload): Promise<{ user: User }> {
    const user = await this.usersRepo.findOne({ where: { id: auth.userId } })
    return { user }
  }
}
