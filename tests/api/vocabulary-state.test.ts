import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const testState = vi.hoisted(() => ({
  userId: null as string | null,
}))

process.env.APP_ENV = 'test'
process.env.APP_URL = 'http://localhost:3000'
process.env.BETTER_AUTH_SECRET = 'vitest-only-secret-with-at-least-32-characters'
process.env.DATABASE_URL = 'file:./vitest.db'

vi.mock('server-only', () => ({}))

vi.mock('@/server/database/client', () => ({
  prisma: {},
}))

vi.mock('@/server/api/session', async () => {
  const { HTTPException } =
    await vi.importActual<typeof import('hono/http-exception')>('hono/http-exception')

  return {
    requireUserId: async () => {
      if (!testState.userId) {
        throw new HTTPException(401, { message: 'Unauthorized' })
      }

      return testState.userId
    },
  }
})

type Api = (typeof import('@/server/api'))['default']

let api: Api

beforeAll(async () => {
  ;({ default: api } = await import('@/server/api'))
})

beforeEach(() => {
  testState.userId = null
})

describe('account-scoped vocabulary state', () => {
  it('[AC-ACCOUNT-001] enforces the session boundary', async () => {
    const guest = await api.request('http://localhost/api/vocabulary/state')
    const spoofed = await api.request('http://localhost/api/vocabulary/state?userId=user-b')

    testState.userId = 'user-a'
    const signedIn = await api.request('http://localhost/api/vocabulary/state')
    const signedInBody = await signedIn.json()

    expect(
      {
        guest: guest.status,
        spoofed: spoofed.status,
        signedIn: signedIn.status,
        signedInBody,
      },
      '[AC-ACCOUNT-001] target session boundary and empty state',
    ).toEqual({
      guest: 401,
      spoofed: 401,
      signedIn: 200,
      signedInBody: { data: { activeBook: null, wordStates: [] } },
    })
  })
})
