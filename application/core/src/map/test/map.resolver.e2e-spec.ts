import { deepEqual, ok } from "node:assert/strict"
import { afterEach, beforeEach, describe, it } from "node:test"

import { faker } from "@faker-js/faker"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import type { User } from "@/__generated__/scheme.generated"
import { AppModule } from "@/app/app.module"
import { apprequest } from "@/app/test/apprequest"

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
  const auth: Partial<{ token: string; user: Partial<User> }> = {}

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    await app.listen(0)

    const {
      registerTemporalUser: { token },
    } = await apprequest({ app }).RegisterTemporalUser()
    const {
      authUser: { user },
    } = await apprequest({
      app,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).AuthUser()
    auth.token = token
    auth.user = user
  })

  afterEach(async () => {
    await app.close()
  })

  describe("saveUserLocation", () => {
    it("should create and return a user location", async () => {
      const [location] = fakeLocation
      const { saveUserLocation: created } = await apprequest({
        app,
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }).SaveUserLocation({ input: { location } })
      const { id, ...rest } = created
      ok(id)
      deepEqual(rest, {
        location: [location.lng, location.lat],
        user: auth.user,
      })
    })

    it("should update and return a user existed location", async () => {
      const [location, updatedLocation] = fakeLocation
      const { saveUserLocation: created } = await apprequest({
        app,
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }).SaveUserLocation({ input: { location } })
      const { saveUserLocation: updated } = await apprequest({
        app,
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }).SaveUserLocation({
        input: {
          id: created.id,
          location: updatedLocation,
        },
      })
      deepEqual(updated, {
        id: created.id,
        location: [updatedLocation.lng, updatedLocation.lat],
        user: auth.user,
      })
    })
  })
})
