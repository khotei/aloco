import { UseGuards } from "@nestjs/common"
import { Mutation, Query, Resolver } from "@nestjs/graphql"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"

import { User } from "@/users/entities/user.entity"

import {
  JwtPayload,
  type JwtPayloadInterface,
} from "./decorators/jwt-payload.decorator"
import { TokenDto } from "./dto/token.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Resolver()
export class AuthenticationResolver {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService
  ) {}
  @Mutation(() => TokenDto, { name: "registerTemporalUser" })
  async createTemporalUser(): Promise<TokenDto> {
    const user = await this.usersRepo.save(this.usersRepo.create())
    const token = await this.jwtService.signAsync(
      { email: user.email, sub: user.id } as JwtPayloadInterface,
      {
        secret: "secret",
      }
    )
    return { token }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: "authUser" })
  async getAuthUser(
    @JwtPayload() jwtPayload: JwtPayloadInterface
  ): Promise<User> {
    return await this.usersRepo.findOne({ where: { id: jwtPayload.sub } })
  }
}
