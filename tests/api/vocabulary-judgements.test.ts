import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { databaseTestAdapter } from '../../scripts/testing/database-adapter.mjs'
import { openMigratedDatabase } from '../support/apply-migrations'

const workspace = mkdtempSync(join(tmpdir(), 'whitepaper-judge-'))
const databasePath = join(workspace, 'judge.db')
process.env.APP_ENV = 'test'
process.env.APP_URL = 'http://localhost:3000'
process.env.BETTER_AUTH_SECRET = 'vitest-only-secret-with-at-least-32-characters'
process.env.DATABASE_URL = databaseTestAdapter.isolatedUrl(databasePath)

type Api = (typeof import('@/server/api'))['default']

let api: Api
let cookieA = ''
let cookieB = ''

async function signUp(email: string, name: string) {
  const { auth } = await import('@/server/auth')
  const response = await auth.api.signUpEmail({
    body: { email, password: 'password12345', name },
    asResponse: true,
  })
  const payload = (await response.json()) as { user?: { id?: string } }
  const cookie = response.headers.get('set-cookie')?.split(';')[0] ?? ''

  expect(response.ok, 'auth setup must succeed').toBe(true)
  expect(cookie, 'auth setup must return a session cookie').not.toBe('')
  expect(payload.user?.id, 'auth setup must return a user id').toBeTruthy()

  return { cookie, userId: payload.user?.id ?? '' }
}

beforeAll(async () => {
  const database = openMigratedDatabase(databasePath)
  database.close()

  ;({ default: api } = await import('@/server/api'))
  ;({ cookie: cookieA } = await signUp(`a-${Date.now()}@example.com`, 'A'))
  ;({ cookie: cookieB } = await signUp(`b-${Date.now()}@example.com`, 'B'))
})

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true })
})

it('[AC-ACCOUNT-005] saves a page of judgements for the signed-in account', async () => {
  const post = await api.request('http://localhost/api/vocabulary/judgements', {
    method: 'POST',
    headers: { cookie: cookieA, 'content-type': 'application/json' },
    body: JSON.stringify({
      judgements: [
        { word: 'apple', known: true },
        { word: 'tree', known: false },
      ],
    }),
  })

  const resubmit = await api.request('http://localhost/api/vocabulary/judgements', {
    method: 'POST',
    headers: { cookie: cookieA, 'content-type': 'application/json' },
    body: JSON.stringify({
      judgements: [
        { word: 'apple', known: false },
        { word: 'tree', known: false },
      ],
    }),
  })

  const stateA = await api.request('http://localhost/api/vocabulary/state', {
    headers: { cookie: cookieA },
  })
  const stateB = await api.request('http://localhost/api/vocabulary/state', {
    headers: { cookie: cookieB },
  })

  expect(
    {
      post: post.status,
      resubmit: resubmit.status,
      bodyA: await stateA.json(),
      bodyB: await stateB.json(),
    },
    '[AC-ACCOUNT-005] target judged words are saved per account',
  ).toEqual({
    post: 200,
    resubmit: 200,
    bodyA: {
      data: {
        activeBook: null,
        wordStates: [
          { word: 'apple', known: false },
          { word: 'tree', known: false },
        ],
      },
    },
    bodyB: { data: { activeBook: null, wordStates: [] } },
  })
})
