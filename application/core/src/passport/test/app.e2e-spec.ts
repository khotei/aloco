import { deepEqual } from "node:assert/strict"
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

  it("/ (GET)", async () => {
    const query = gql`
      query MyQuery {
        register
      }
    `
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .send({
        query: print(query),
      })

    deepEqual(
      { body: response.body },
      { body: { data: { register: "register" } } }
    )
  })
})
