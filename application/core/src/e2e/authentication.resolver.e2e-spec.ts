import { ok, rejects } from "node:assert/strict"
import { after, afterEach, before, beforeEach, describe, it } from "node:test"

import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { DataSource } from "typeorm"

import { apprequest } from "@/api/tests/requests/app-request"
import { AppModule } from "@/app.module"

describe("AuthenticationResolver (e2e)", () => {
  let app: INestApplication

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
  })

  afterEach(async () => {
    await app.get(DataSource).dropDatabase()
  })

  after(async () => {
    await app.close()
  })

  it("should create a user and return token", async () => {
    const { registerTemporalUser } = await apprequest({
      app,
    }).RegisterTemporalUser()
    ok(registerTemporalUser.token)
  })

  it("should return authenticated user", async () => {
    const { registerTemporalUser } = await apprequest({
      app,
    }).RegisterTemporalUser()
    ok(registerTemporalUser.token)
    const {
      authUser: { user },
    } = await apprequest({
      app,
      token: registerTemporalUser.token,
    }).AuthUser()
    ok(user.id)
  })

  it("should throw unauthenticated error when user is not authenticated", async () => {
    await rejects(
      async () => {
        try {
          await apprequest({ app }).AuthUser()
        } catch (e) {
          throw { message: e.response.errors.at(0).message }
        }
      },
      { message: "Unauthorized" }
    )
  })
})
