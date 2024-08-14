import { deepEqual, ok } from "node:assert/strict"
import { afterEach, beforeEach, describe, it } from "node:test"

import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"

import { AppModule } from "@/app/app.module"
import { apprequest } from "@/app/test/apprequest"

describe("AuthenticationResolver (e2e)", () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    await app.listen(0)
  })

  afterEach(async () => {
    await app.close()
  })

  describe("registerTemporalUser", () => {
    it("should create a user and return token", async () => {
      const { registerTemporalUser } = await apprequest(app)
        .getSdk()
        .RegisterTemporalUser()
      ok(registerTemporalUser.token)
    })
  })

  describe("authUser", () => {
    it("should return authenticated user", async () => {
      const { registerTemporalUser } = await apprequest(app)
        .getSdk()
        .RegisterTemporalUser()
      const { authUser } = await apprequest(app)
        .set("Authorization", `Bearer ${registerTemporalUser.token}`)
        .getSdk()
        .AuthUser()
      ok(authUser.id)
    })

    it("should throw unauthenticated error when user is not authenticated", async () => {
      try {
        await apprequest(app).getSdk().AuthUser()
      } catch (e) {
        deepEqual(e.response.errors[0].message, "Unauthorized")
      }
    })
  })
})
