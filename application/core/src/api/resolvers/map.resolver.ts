import {
  ClassSerializerInterceptor,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common"
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql"
import { InjectRepository } from "@nestjs/typeorm"
import { MoreThanOrEqual, type Repository } from "typeorm"

import {
  Auth,
  type AuthPayload,
} from "@/api/authentication/decorators/auth.decorator"
import { JwtAuthGuard } from "@/api/authentication/guards/jwt-auth.guard"
import { SaveUserLocationInput } from "@/api/dto/map/save-user-location-input.dto"
import { UserLocationResponse } from "@/api/dto/map/user-location.dto"
import { UsersLocationsResponse } from "@/api/dto/map/users-locations-response.dto"
import { UserLocation } from "@/domain/entities/user-location.entity"
import { User } from "@/domain/entities/user.entity"

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Resolver()
export class MapResolver {
  constructor(
    @InjectRepository(UserLocation)
    private userLocationRepo: Repository<UserLocation>,
    @InjectRepository(User)
    private userRepo: Repository<User>
  ) {}

  @Query(() => UsersLocationsResponse, { name: "usersLocations" })
  async find(): Promise<UsersLocationsResponse> {
    const onlineMs = 5_000
    const minUpdatedAt = new Date(new Date().getTime() - onlineMs)
    const usersLocations = await this.userLocationRepo.find({
      where: {
        updatedAt: MoreThanOrEqual(minUpdatedAt),
      },
    })
    return { usersLocations }
  }

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
          updatedAt: new Date(),
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
