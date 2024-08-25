import { deepEqual, ok } from "node:assert/strict"
import { afterEach, beforeEach, describe, it } from "node:test"

import { faker } from "@faker-js/faker"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { DataSource } from "typeorm"

import type { User } from "@/__generated__/scheme.generated"
import { AppModule } from "@/app/app.module"
import { apprequest } from "@/app/test/apprequest"
import { testSignUp } from "@/app/test/test-sign-up"

const fakeLocation = [
  {
    lat: faker.location.latitude(),
    lng: faker.location.longitude(),
  },
  {
    lat: faker.location.latitude(),
    lng: faker.location.longitude(),
  },
  {
    lat: faker.location.latitude(),
    lng: faker.location.longitude(),
  },
]

describe("MapResolver (e2e)", () => {
  let app: INestApplication
  const auth: Partial<{ token: string; user: Partial<User> }>[] = []

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    await app.listen(0)

    auth.push(await testSignUp({ app }))
  })

  afterEach(async () => {
    await app.get(DataSource).dropDatabase()
    await app.close()
  })

  it("should create and return a user location", async () => {
    const [location] = fakeLocation
    const {
      saveUserLocation: { userLocation: created },
    } = await apprequest({
      app,
      token: auth.at(0).token,
    }).SaveUserLocation({ input: { location } })
    const { id, ...rest } = created
    ok(id)
    deepEqual(rest, {
      location: [location.lat, location.lng],
      user: auth.at(0).user,
    })
  })

  it("should update and return a user existed location", async () => {
    const [location, updatedLocation] = fakeLocation
    const {
      saveUserLocation: { userLocation: created },
    } = await apprequest({
      app,
      token: auth.at(0).token,
    }).SaveUserLocation({ input: { location } })
    const {
      saveUserLocation: { userLocation: updated },
    } = await apprequest({
      app,
      token: auth.at(0).token,
    }).SaveUserLocation({
      input: {
        location: updatedLocation,
      },
    })
    deepEqual(updated, {
      id: created.id,
      location: [updatedLocation.lat, updatedLocation.lng],
      user: auth.at(0).user,
    })
  })
})
