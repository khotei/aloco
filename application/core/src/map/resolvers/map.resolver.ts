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
    const usersLocations = await this.userLocationRepo.find()
    return { usersLocations }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserLocationResponse, { name: "saveUserLocation" })
  async save(
    @Auth() auth: AuthPayload,
    @Args("saveUserLocationInput") input: SaveUserLocationInput
  ): Promise<UserLocationResponse> {
    const user = await this.userRepo.findOneByOrFail({ id: auth.userId })
    const userLocation = await this.userLocationRepo.findOneBy({
      user: { id: user.id },
    })
    if (userLocation) {
      await this.userLocationRepo.save(
        this.userLocationRepo.merge(userLocation, {
          location: [input.location.lat, input.location.lng],
        })
      )
      return { userLocation }
    } else {
      const userLocation = await this.userLocationRepo.save(
        this.userLocationRepo.create({
          location: [input.location.lat, input.location.lng],
          user,
        })
      )
      return { userLocation }
    }
  }
}
