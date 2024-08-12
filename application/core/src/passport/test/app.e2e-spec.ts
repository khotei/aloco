import { deepEqual, ok } from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"

import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { print } from "graphql"
import { gql } from "graphql-tag"
import * as request from "supertest"

import { AppModule } from "@/app/app.module"

const registerTemporalUserMutation = gql`
  mutation RegisterTemporalUser {
    registerTemporalUser {
      token
    }
  }
`

const authUserQuery = gql`
  query AuthUser {
    authUser {
      id
      email
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
      const { body } = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: print(registerTemporalUserMutation),
        })
      ok(body.data.registerTemporalUser.token)
    })
  })

  describe("authUser", () => {
    it("should return authenticated user", async () => {
      const {
        body: {
          data: {
            registerTemporalUser: { token },
          },
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
      ok(body.data.authUser.id)
      deepEqual(body.data.authUser.email, null)
    })

    it("should throw unauthorization error when user is not authenticated", async () => {
      const { body } = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: print(authUserQuery),
        })
      deepEqual(body.data, null)
      deepEqual(body.errors[0].message, "Unauthorized")
    })
  })
})
