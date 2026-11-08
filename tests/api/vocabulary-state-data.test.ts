import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { databaseTestAdapter } from '../../scripts/testing/database-adapter.mjs'
import { openMigratedDatabase } from '../support/apply-migrations'

const workspace = mkdtempSync(join(tmpdir(), 'whitepaper-state-'))
const databasePath = join(workspace, 'state.db')
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
    body: {
      email: 'a@example.test',
      password: 'password12345',
      name: 'A',
    },
    asResponse: true,
  })
  const payload = (await signUp.json()) as { user?: { id?: string } }
  cookie = signUp.headers.get('set-cookie')?.split(';')[0] ?? ''

  expect(signUp.ok, 'auth setup must succeed').toBe(true)
  expect(cookie, 'auth setup must return a session cookie').not.toBe('')
  expect(payload.user?.id, 'auth setup must return a user id').toBeTruthy()

  const seed = new PrismaClient()
  await seed.word_state.create({
    data: {
      userId: payload.user?.id ?? '',
      bookId: 'parallel-world',
      localDate: new Date().toISOString().slice(0, 10),
      word: 'apple',
      known: true,
    },
  })
  await seed.$disconnect()
})

afterAll(() => {
  rmSync(workspace, { recursive: true, force: true })
})

it('[AC-ACCOUNT-003] returns the signed-in account word states', async () => {
  const response = await api.request('http://localhost/api/vocabulary/state', {
    headers: { cookie },
  })
  const body = await response.json()

  expect(body, '[AC-ACCOUNT-003] target signed-in body must include the stored word state').toEqual(
    { data: { activeBook: null, wordStates: [{ word: 'apple', known: true }] } },
  )
})
