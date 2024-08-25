import { deepEqual, match, ok, rejects } from "node:assert/strict"
import { afterEach, beforeEach, describe, it } from "node:test"

import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { notEquals } from "class-validator"
import { createClient } from "graphql-ws"
import { DataSource } from "typeorm"

import {
  InvitationStatus,
  type SendInvitationInput,
  type User,
} from "@/__generated__/scheme.generated"
import { AppModule } from "@/app/app.module"
import { apprequest } from "@/app/test/apprequest"
import { testSignUp } from "@/app/test/test-sign-up"

describe("InvitationsResolver (e2e)", () => {
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
    auth.push(await testSignUp({ app }))
    auth.push(await testSignUp({ app }))
    auth.push(await testSignUp({ app }))
  })

  afterEach(async () => {
    await app.get(DataSource).dropDatabase()
    await app.close()
  })

  it("should create and return invitation", async () => {
    const authReceiver = auth.at(1)
    const input = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    const authSender = auth.at(0)
    const {
      sendInvitation: { invitation },
    } = await apprequest({
      app,
      token: authSender.token,
    }).SendInvitation({
      input,
    })
    const { createdAt, id, updatedAt, ...restCreated } = invitation
    ok(id)
    ok(createdAt)
    ok(updatedAt)
    deepEqual(restCreated, {
      receiver: authReceiver.user,
      sender: authSender.user,
      status: InvitationStatus.Pending,
    })
  })

  it("should throw error when user create invitation without receiver", async () => {
    const input: SendInvitationInput = {
      status: InvitationStatus.Pending,
    }
    const authSender = auth.at(0)
    await rejects(
      async () => {
        try {
          await apprequest({
            app,
            token: authSender.token,
          }).SendInvitation({
            input,
          })
        } catch (error) {
          throw error.response.errors.at(0).validationErrors
        }
      },
      {
        receiverId: ["receiverId must be a number"],
      }
    )
  })

  it("should update and return invitation", async () => {
    const authReceiver = auth.at(1)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    const authSender = auth.at(0)
    const {
      sendInvitation: {
        invitation: { updatedAt: createdUpdatedAt, ...restCreated },
      },
    } = await apprequest({
      app,
      token: authSender.token,
    }).SendInvitation({
      input: createInput,
    })
    const updateInput = {
      id: restCreated.id,
      status: InvitationStatus.Canceled,
    }
    const {
      sendInvitation: {
        invitation: { updatedAt: updatedUpdatedAt, ...restUpdated },
      },
    } = await apprequest({
      app,
      token: authSender.token,
    }).SendInvitation({
      input: updateInput,
    })
    notEquals(createdUpdatedAt, updatedUpdatedAt)
    deepEqual(restUpdated, {
      ...restCreated,
      ...updateInput,
    })
  })

  it("should throw error when user try to update invitation that doesn't belong to him", async () => {
    const authReceiver = auth.at(2)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    const authSenderOwner = auth.at(1)
    const {
      sendInvitation: { invitation },
    } = await apprequest({
      app,
      token: authSenderOwner.token,
    }).SendInvitation({
      input: createInput,
    })
    const updateInput = {
      id: invitation.id,
      status: InvitationStatus.Canceled,
    }
    const authSenderNotOwner = auth.at(0)
    await rejects(
      async () => {
        try {
          await apprequest({
            app,
            token: authSenderNotOwner.token,
          }).SendInvitation({
            input: updateInput,
          })
        } catch (e) {
          throw e.response.errors.at(0)
        }
      },
      ({ message }) => {
        try {
          match(message, /Could not find any entity/i)
          return true
        } catch {
          return false
        }
      }
    )
  })

  it("should emit invitation when user", async () => {
    const authSender = auth.at(0)
    const url = `http://127.0.0.1:${app.getHttpServer().address().port}/graphql`
    const client = createClient({
      connectionParams: {
        Authorization: `Bearer ${authSender.token}`,
      },
      url,
    })

    const invitationSentPromise = new Promise<any>((resolve, reject) => {
      client.subscribe(
        {
          query: `
          subscription InvitationSent {
  invitationSent {
    invitation {
      id
      sender {
        id
      }
      receiver {
        id
      }
      status
      createdAt
      updatedAt
    }
  }
}`,
        },
        {
          complete: () => {
            console.log("complete")
          },
          error: reject,
          next: resolve,
        }
      )
      console.log("subscribed")
    })

    const authReceiver = auth.at(1)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    const {
      sendInvitation: { invitation },
    } = await apprequest({
      app,
      token: authSender.token,
    }).SendInvitation({
      input: createInput,
    })

    console.log("send-test", invitation)
    console.log("promise", await invitationSentPromise)
  })

  it("should emit invitation when user sender", async () => {
    const authSender = auth.at(0)
    const url = `http://127.0.0.1:${app.getHttpServer().address().port}/graphql`
    const client = createClient({
      connectionParams: {
        Authorization: `Bearer ${authSender.token}`,
      },
      url,
    })
    const authReceiver = auth.at(1)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }

    const value: any = await new Promise((resolve, reject) => {
      const sub = client.iterate({
        query: `
          subscription InvitationSent {
  invitationSent {
    invitation {
      id
      sender {
        id
      }
      receiver {
        id
      }
      status
      createdAt
      updatedAt
    }
  }
}`,
      })

      apprequest({
        app,
        token: authSender.token,
      }).SendInvitation({
        input: createInput,
      })
      sub
        .next()
        .then((value) => {
          resolve(value)
        })
        .catch(reject)
    })

    console.log(value.value.errors)
  })
})
