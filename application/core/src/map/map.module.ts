import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"

import { UserLocation } from "@/map/entities/user-location.entity"
import { User } from "@/users/entities/user.entity"

import { MapResolver } from "./resolvers/map.resolver"

@Module({
  imports: [TypeOrmModule.forFeature([User, UserLocation])],
  providers: [MapResolver],
})
export class MapModule {}
