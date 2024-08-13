import { deepEqual, ok } from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"

import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { print } from "graphql"
import { gql } from "graphql-tag"
import * as request from "supertest"

import { AppModule } from "@/app/app.module"

export const registerTemporalUserMutation = gql`
  mutation RegisterTemporalUser {
    registerTemporalUser {
      token
    }
  }
`

export const authUserQuery = gql`
  query AuthUser {
    authUser {
      id
    }
  }
`

describe("AuthenticationResolver (e2e)", () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe("registerTemporalUser", () => {
    it("should create a user and return token", async () => {
      const {
        body: { data, errors },
      } = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: print(registerTemporalUserMutation),
        })
      deepEqual(errors, undefined)
      ok(data.registerTemporalUser.token)
    })
  })

  describe("authUser", () => {
    it("should return authenticated user", async () => {
      const {
        body: {
          data: {
            registerTemporalUser: { token },
          },
          errors,
        },
      } = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: print(registerTemporalUserMutation),
        })
      const { body } = await request(app.getHttpServer())
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: print(authUserQuery),
        })
      deepEqual(errors, undefined)
      ok(body.data.authUser.id)
    })

    it("should throw unauthenticated error when user is not authenticated", async () => {
      const {
        body: { data, errors },
      } = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: print(authUserQuery),
        })
      deepEqual(data, null)
      deepEqual(errors[0].message, "Unauthorized")
    })
  })
})
