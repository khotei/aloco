import { UseGuards } from "@nestjs/common"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"

import { SaveUserLocationInput } from "@/map/dto/save-loation-inpute.dto"
import { UserLocation } from "@/map/entities/user-location.entity"
import {
  Auth,
  type AuthPayload,
} from "@/passport/authentication/decorators/auth.decorator"
import { JwtAuthGuard } from "@/passport/authentication/guards/jwt-auth.guard"
import { User } from "@/users/entities/user.entity"

@Resolver()
export class MapResolver {
  constructor(
    @InjectRepository(UserLocation)
    private userLocationRepo: Repository<UserLocation>,
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserLocation, { name: "saveUserLocation" })
  async saveUserLocation(
    @Auth() auth: AuthPayload,
    @Args("saveUserLocationInput") input: SaveUserLocationInput
  ): Promise<UserLocation> {
    const user = await this.userRepo.findOne({ where: { id: auth.userId } })
    const userLocation = input.id
      ? await this.userLocationRepo.preload({
          id: input.id,
          location: [input.location.lng, input.location.lat],
          user,
        })
      : this.userLocationRepo.create({
          location: [input.location.lng, input.location.lat],
          user,
        })
    return await this.userLocationRepo.save(userLocation)
  }
}
