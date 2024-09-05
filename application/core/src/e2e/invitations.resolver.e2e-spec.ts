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
import { DataSource } from "typeorm"

import {
  InvitationSentDocument,
  InvitationStatus,
  type SendInvitationInput,
  type UserFragmentFragment,
} from "@/__generated__/scheme.generated"
import { AppModule } from "@/app.module"
import { apprequest } from "@/test/requests/app-request"
import { appsubscribe } from "@/test/requests/app-subscribe"
import { requestSendInvitation } from "@/test/requests/request-send-invitation"
import { requestSignUp } from "@/test/requests/request-sign-up"
import { subscribeInvitationSent } from "@/test/requests/subscribe-invitation-sent"

describe("InvitationsResolver (e2e)", () => {
  let app: INestApplication
  const auth: Partial<{ token: string; user: UserFragmentFragment }>[] = []

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    await app.listen(0)

    auth.push(await requestSignUp({ app }))
    auth.push(await requestSignUp({ app }))
    auth.push(await requestSignUp({ app }))
    auth.push(await requestSignUp({ app }))
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
    const { invitation } = await requestSendInvitation({
      app,
      input,
      token: authSender.token,
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
          await requestSendInvitation({
            app,
            input,
            token: authSender.token,
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
      invitation: { updatedAt: createdUpdatedAt, ...restCreated },
    } = await requestSendInvitation({
      app,
      input: createInput,
      token: authSender.token,
    })
    const updateInput = {
      id: restCreated.id,
      status: InvitationStatus.Canceled,
    }
    const {
      invitation: { updatedAt: updatedUpdatedAt, ...restUpdated },
    } = await requestSendInvitation({
      app,
      input: updateInput,
      token: authSender.token,
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
    const { invitation } = await requestSendInvitation({
      app,
      input: createInput,
      token: authSenderOwner.token,
    })
    const updateInput = {
      id: invitation.id,
      status: InvitationStatus.Canceled,
    }
    const authSenderNotOwner = auth.at(0)
    await rejects(
      async () => {
        try {
          await requestSendInvitation({
            app,
            input: updateInput,
            token: authSenderNotOwner.token,
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
    const { sub } = await subscribeInvitationSent({
      app,
      token: authSender.token,
    })

    const authReceiver = auth.at(1)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    const { invitation: created } = await requestSendInvitation({
      app,
      input: createInput,
      token: authSender.token,
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
    const { sub } = await subscribeInvitationSent({
      app,
      token: authReceiver.token,
    })

    const authSender = auth.at(0)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    const { invitation: created } = await requestSendInvitation({
      app,
      input: createInput,
      token: authSender.token,
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

  it("should emit accepted invitation for sender when receiver accept", async () => {
    const authReceiver = auth.at(1)
    const { sub } = await subscribeInvitationSent({
      app,
      token: authReceiver.token,
    })
    const authSender = auth.at(0)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    const { invitation: created } = await requestSendInvitation({
      app,
      input: createInput,
      token: authSender.token,
    })
    const {
      value: {
        data: {
          invitationSent: { invitation: createdEmitted },
        },
      },
    } = await sub.next()
    deepEqual(createdEmitted, created)

    const acceptInput = {
      id: created.id,
      status: InvitationStatus.Accepted,
    }
    const {
      sendInvitation: { invitation: accepted },
    } = await apprequest({
      app,
      token: authReceiver.token,
    }).SendInvitation({
      input: acceptInput,
    })
    const {
      value: {
        data: {
          invitationSent: { invitation: acceptedEmmitted },
        },
      },
    } = await sub.next()
    deepEqual(acceptedEmmitted, accepted)
    await sub.return()
  })

  it("should not emit invitation when listener is not receiver or sender", async () => {
    const authListener = auth.at(3)
    const { sub } = await appsubscribe({
      app,
      query: InvitationSentDocument.loc.source.body,
      token: authListener.token,
    })

    const authSender = auth.at(0)
    const authReceiver = auth.at(1)
    const createInput = {
      receiverId: authReceiver.user.id,
      status: InvitationStatus.Pending,
    }
    await requestSendInvitation({
      app,
      input: createInput,
      token: authSender.token,
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
