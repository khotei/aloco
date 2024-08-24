import { faker } from "@faker-js/faker"
import { NestFactory } from "@nestjs/core"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"

import { AppModule } from "@/app/app.module"
import { UserLocation } from "@/map/entities/user-location.entity"
import { User } from "@/users/entities/user.entity"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.init()

  const usersRepo = app.get<Repository<User>>(getRepositoryToken(User))
  const users = await Promise.all(
    new Array(50).fill(null).map(() => usersRepo.save(usersRepo.create()))
  )
  const usersLocationsRepo = app.get<Repository<UserLocation>>(
    getRepositoryToken(UserLocation)
  )
  await Promise.all(
    users.map((user) =>
      usersLocationsRepo.save(
        usersLocationsRepo.create({
          location: [faker.location.latitude(), faker.location.longitude()],
          user,
        })
      )
    )
  )

  await app.close()
}
bootstrap()
