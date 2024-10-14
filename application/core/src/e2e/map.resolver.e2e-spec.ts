import { deepEqual, notDeepEqual, ok } from "node:assert/strict"
import { after, afterEach, before, beforeEach, describe, it } from "node:test"

import { faker } from "@faker-js/faker"
import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { DataSource } from "typeorm"

import type { UserFragmentFragment } from "@/__generated__/scheme.generated"
import { AppModule } from "@/app.module"
import { apprequest } from "@/test/requests/app-request"
import { requestSignUp } from "@/test/requests/request-sign-up"

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
  const auth: Partial<{ token: string; user: UserFragmentFragment }>[] = []

  before(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    await app.listen(0)

    await app.get(DataSource).dropDatabase()
  })

  beforeEach(async () => {
    await app.get(DataSource).synchronize()

    auth.push(await requestSignUp({ app }))
  })

  afterEach(async () => {
    await app.get(DataSource).dropDatabase()
  })

  after(async () => {
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
    const { id, updatedAt, ...rest } = created
    ok(id)
    ok(updatedAt)
    deepEqual(rest, {
      location,
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
      saveUserLocation: {
        userLocation: { updatedAt, ...restUpdated },
      },
    } = await apprequest({
      app,
      token: auth.at(0).token,
    }).SaveUserLocation({
      input: {
        location: updatedLocation,
      },
    })
    ok(updatedAt)
    deepEqual(restUpdated, {
      id: created.id,
      location: updatedLocation,
      user: auth.at(0).user,
    })
  })

  it("should update updatedAt", async () => {
    const [location, location2, location3] = fakeLocation
    const {
      saveUserLocation: {
        userLocation: { updatedAt: createdUpdatedAt },
      },
    } = await apprequest({
      app,
      token: auth.at(0).token,
    }).SaveUserLocation({ input: { location } })
    const {
      saveUserLocation: {
        userLocation: { updatedAt: firstUpdateUpdatedAt },
      },
    } = await apprequest({
      app,
      token: auth.at(0).token,
    }).SaveUserLocation({ input: { location: location2 } })
    const {
      saveUserLocation: {
        userLocation: { updatedAt: secondUpdateUpdatedAt },
      },
    } = await apprequest({
      app,
      token: auth.at(0).token,
    }).SaveUserLocation({ input: { location: location3 } })
    notDeepEqual(
      { updatedAt: createdUpdatedAt },
      { updatedAt: firstUpdateUpdatedAt }
    )
    notDeepEqual(
      { updatedAt: firstUpdateUpdatedAt },
      { updatedAt: secondUpdateUpdatedAt }
    )
  })
})
