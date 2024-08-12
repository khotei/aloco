import { ok } from "node:assert/strict"
import { beforeEach, describe, it } from "node:test"

import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { print } from "graphql"
import { gql } from "graphql-tag"
import * as request from "supertest"

import { AppModule } from "@/app/app.module"

describe("AuthenticationResolver (e2e)", () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  describe("Register Temporal User", () => {
    const query = gql`
      mutation RegisterTemporalUser {
        registerTemporalUser {
          token
        }
      }
    `

    it("should create a user and return token", async () => {
      const { body } = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: print(query),
        })
      ok(body.data.registerTemporalUser.token)
    })
  })

  describe.skip("Register Regular User", () => {
    it("should successfully register user return token", async () => {})

    it("should throw error when email already exists", async () => {})
  })
})
