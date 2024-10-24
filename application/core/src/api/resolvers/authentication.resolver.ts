import { Inject, UseGuards } from "@nestjs/common"
import { Mutation, Query, Resolver } from "@nestjs/graphql"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { StreamClient } from "@stream-io/node-sdk"
import { Repository } from "typeorm"

import {
  Auth,
  type AuthPayload,
} from "@/api/authentication/decorators/auth.decorator"
import { AuthResponse } from "@/api/authentication/dto/auth.dto"
import { TokenResponse } from "@/api/authentication/dto/token-response.dto"
import { JwtAuthGuard } from "@/api/authentication/guards/jwt-auth.guard"
import type { JwtPayload } from "@/api/authentication/strategies/jwt.strategy"
import {
  type ServicesConfig,
  servicesConfigs,
} from "@/common/configs/environments"
import { User } from "@/domain/entities/user.entity"

@Resolver()
export class AuthenticationResolver {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(servicesConfigs.KEY)
    private readonly config: ServicesConfig
  ) {}
  @UseGuards(JwtAuthGuard)
  @Mutation(() => TokenResponse, { name: "createStreamToken" })
  async createStreamToken(@Auth() auth: AuthPayload): Promise<TokenResponse> {
    /**
     * @todo: improve. move to the service or separate resolver
     */
    const client = new StreamClient(
      this.config.getStreamApiKey,
      this.config.getStreamApiSecret
    )
    const token = client.generateUserToken({ user_id: auth.userId.toString() })
    return { token }
  }

  @Mutation(() => TokenResponse, { name: "registerTemporalUser" })
  async createTemporalUser(): Promise<TokenResponse> {
    const user = await this.usersRepo.save(this.usersRepo.create())

    const jwtPayload: JwtPayload = { userId: user.id }
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
