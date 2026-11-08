import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { databaseTestAdapter } from '../../scripts/testing/database-adapter.mjs'
import { openMigratedDatabase } from '../support/apply-migrations'

const workspace = mkdtempSync(join(tmpdir(), 'whitepaper-history-'))
const databasePath = join(workspace, 'history.db')
process.env.APP_ENV = 'test'
process.env.APP_URL = 'http://localhost:3000'
process.env.BETTER_AUTH_SECRET = 'vitest-only-secret-with-at-least-32-characters'
process.env.DATABASE_URL = databaseTestAdapter.isolatedUrl(databasePath)

type Api = (typeof import('@/server/api'))['default']

let api: Api
let cookie = ''
let userId = ''

beforeAll(async () => {
  const database = openMigratedDatabase(databasePath)
  database.close()

  const { auth } = await import('@/server/auth')
  ;({ default: api } = await import('@/server/api'))

  const signUp = await auth.api.signUpEmail({
    body: {
      email: `history-${Date.now()}@example.com`,
      password: 'password12345',
      name: 'History',
    },
    asResponse: true,
  })
  const payload = (await signUp.json()) as { user?: { id?: string } }
  cookie = signUp.headers.get('set-cookie')?.split(';')[0] ?? ''
  userId = payload.user?.id ?? ''
  expect(cookie, 'auth setup must return a cookie').not.toBe('')

  const seed = new PrismaClient()
  await seed.daily_session.createMany({
    data: [
      {
        userId,
        bookId: 'parallel-world',
        localDate: '2026-11-08',
        round: 2,
        cursor: 36,
        ids: JSON.stringify(['a', 'b']),
        missed: JSON.stringify(['b']),
        history: JSON.stringify([{ round: 1, total: 2, missed: 1 }]),
        complete: false,
      },
      {
        userId,
        bookId: 'parallel-world',
        localDate: '2026-11-07',
        round: 1,
        cursor: 1,
        ids: JSON.stringify(['c']),
        missed: JSON.stringify([]),
        history: JSON.stringify([]),
        complete: true,
      },
    ],
  })
  await seed.word_state.createMany({
    data: [
      { userId, bookId: 'parallel-world', localDate: '2026-11-08', word: 'apple', known: true },
      { userId, bookId: 'parallel-world', localDate: '2026-11-08', word: 'tree', known: false },
      { userId, bookId: 'parallel-world', localDate: '2026-11-07', word: 'grass', known: true },
    ],
  })
  await seed.$disconnect()
})

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true })
})

it('[AC-ACCOUNT-011] returns daily study history', async () => {
  const response = await api.request(
    'http://localhost/api/vocabulary/history?bookId=parallel-world&days=30',
    { headers: { cookie } },
  )

  const body = await response.json().catch(() => null)

  expect(body, '[AC-ACCOUNT-011] target daily history from newest to oldest').toEqual({
    data: {
      history: [
        { date: '2026-11-08', words: 2, known: 1, unknown: 1, rounds: 2, complete: false },
        { date: '2026-11-07', words: 1, known: 1, unknown: 0, rounds: 1, complete: true },
      ],
    },
  })
})
