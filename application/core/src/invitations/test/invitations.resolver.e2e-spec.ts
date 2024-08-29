import {
  deepEqual,
  equal,
  match,
  notEqual,
  ok,
  rejects,
} from "node:assert/strict"
import { afterEach, beforeEach, describe, it } from "node:test"

import { INestApplication } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
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
    notEqual(createdUpdatedAt, updatedUpdatedAt)
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

  it("should emit invitation when listener is sender", async () => {
    const authSender = auth.at(0)
    const url = `http://127.0.0.1:${app.getHttpServer().address().port}/graphql`
    const client = createClient({
      connectionParams: {
        Authorization: `Bearer ${authSender.token}`,
      },
      url,
    })
    /**
     * @todo: improve type-safe
     */
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

    const authReceiver = auth.at(1)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    const {
      sendInvitation: { invitation: created },
    } = await apprequest({
      app,
      token: authSender.token,
    }).SendInvitation({
      input: createInput,
    })
    const {
      value: {
        data: {
          invitationSent: { invitation: emitted },
        },
      },
    } = await sub.next()
    deepEqual(emitted, created)
    await sub.return()
  })

  it("should emit invitation when listener is receiver", async () => {
    const authReceiver = auth.at(1)
    const url = `http://127.0.0.1:${app.getHttpServer().address().port}/graphql`
    const client = createClient({
      connectionParams: {
        Authorization: `Bearer ${authReceiver.token}`,
      },
      url,
    })
    /**
     * @todo: improve type-safe
     */
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

    const authSender = auth.at(0)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    const {
      sendInvitation: { invitation: created },
    } = await apprequest({
      app,
      token: authSender.token,
    }).SendInvitation({
      input: createInput,
    })
    const {
      value: {
        data: {
          invitationSent: { invitation: emitted },
        },
      },
    } = await sub.next()
    deepEqual(emitted, created)
    await sub.return()
  })

  it("should not emit invitation when listener is not receiver or sender", async () => {
    const authListener = auth.at(3)
    const url = `http://127.0.0.1:${app.getHttpServer().address().port}/graphql`
    const client = createClient({
      connectionParams: {
        Authorization: `Bearer ${authListener.token}`,
      },
      url,
    })
    /**
     * @todo: improve type-safe
     */
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

    const authSender = auth.at(0)
    const authReceiver = auth.at(1)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    await apprequest({
      app,
      token: authSender.token,
    }).SendInvitation({
      input: createInput,
    })
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1000))
    let received = false
    sub.next().then(() => {
      received = true
    })
    await timeoutPromise
    equal(received, false)
    await sub.return()
  })
})
