import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { databaseTestAdapter } from '../../scripts/testing/database-adapter.mjs'
import { openMigratedDatabase } from '../support/apply-migrations'

const workspace = mkdtempSync(join(tmpdir(), 'whitepaper-daily-'))
const databasePath = join(workspace, 'daily.db')
process.env.APP_ENV = 'test'
process.env.APP_URL = 'http://localhost:3000'
process.env.BETTER_AUTH_SECRET = 'vitest-only-secret-with-at-least-32-characters'
process.env.DATABASE_URL = databaseTestAdapter.isolatedUrl(databasePath)

type Api = (typeof import('@/server/api'))['default']

let api: Api
let cookie = ''

beforeAll(async () => {
  const database = openMigratedDatabase(databasePath)
  database.close()

  const { auth } = await import('@/server/auth')
  ;({ default: api } = await import('@/server/api'))

  const signUp = await auth.api.signUpEmail({
    body: { email: `daily-${Date.now()}@example.com`, password: 'password12345', name: 'Daily' },
    asResponse: true,
  })
  cookie = signUp.headers.get('set-cookie')?.split(';')[0] ?? ''
  expect(signUp.ok, 'auth setup must succeed').toBe(true)
  expect(cookie, 'auth setup must return a cookie').not.toBe('')
})

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true })
})

it('[AC-ACCOUNT-009] isolates word states by book and local date', async () => {
  const post = await api.request('http://localhost/api/vocabulary/judgements', {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify({
      bookId: 'parallel-world',
      date: '2026-11-08',
      judgements: [{ word: 'apple', known: true }],
    }),
  })

  const dayOne = await api.request(
    'http://localhost/api/vocabulary/state?bookId=parallel-world&date=2026-11-08',
    { headers: { cookie } },
  )
  const dayTwo = await api.request(
    'http://localhost/api/vocabulary/state?bookId=parallel-world&date=2026-11-09',
    { headers: { cookie } },
  )

  expect(
    {
      post: post.status,
      dayOne: await dayOne.json(),
      dayTwo: await dayTwo.json(),
    },
    '[AC-ACCOUNT-009] target word states are scoped by book and date',
  ).toEqual({
    post: 200,
    dayOne: { data: { activeBook: null, wordStates: [{ word: 'apple', known: true }] } },
    dayTwo: { data: { activeBook: null, wordStates: [] } },
  })
})
