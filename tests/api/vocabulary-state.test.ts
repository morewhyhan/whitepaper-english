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
  it('[AC-ACCOUNT-001] rejects guests', async () => {
    const response = await api.request('http://localhost/api/vocabulary/state')

    expect(response.status, '[AC-ACCOUNT-001] target guest must receive 401').toBe(401)
  })

  it('[AC-ACCOUNT-001] ignores a client supplied user id for guests', async () => {
    const response = await api.request('http://localhost/api/vocabulary/state?userId=user-b')

    expect(
      response.status,
      '[AC-ACCOUNT-001] target guest with client userId must receive 401',
    ).toBe(401)
  })

  it('[AC-ACCOUNT-001] returns the signed-in empty state', async () => {
    testState.userId = 'user-a'
    const response = await api.request('http://localhost/api/vocabulary/state')

    expect(response.status, '[AC-ACCOUNT-001] target signed-in request must receive 200').toBe(200)
    expect(await response.json()).toEqual({ data: { activeBook: null, wordStates: [] } })
  })
})
