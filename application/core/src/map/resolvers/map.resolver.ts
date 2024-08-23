import { UseGuards } from "@nestjs/common"
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"

import { SaveUserLocationInput } from "@/map/dto/save-user-location-input.dto"
import { UserLocationResponse } from "@/map/dto/user-location.dto"
import { UsersLocationsResponse } from "@/map/dto/users-locations.dto"
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
  @Query(() => UsersLocationsResponse, { name: "usersLocations" })
  async find(): Promise<UsersLocationsResponse> {
    const usersLocations = await this.userLocationRepo.find({
      relations: { user: true },
    })
    return { usersLocations }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserLocationResponse, { name: "saveUserLocation" })
  async save(
    @Auth() auth: AuthPayload,
    @Args("saveUserLocationInput") input: SaveUserLocationInput
  ): Promise<UserLocationResponse> {
    const user = await this.userRepo.findOneByOrFail({ id: auth.userId })
    const userLocation = input.id
      ? await this.userLocationRepo.preload({
          id: input.id,
          location: [input.location.lng, input.location.lat],
          user,
        })
      : await this.userLocationRepo.save(
          this.userLocationRepo.create({
            location: [input.location.lng, input.location.lat],
            user,
          })
        )
    return { userLocation }
  }
}
