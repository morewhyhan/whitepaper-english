import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { beforeAll, expect, it } from 'vitest'
import { databaseTestAdapter } from '../../scripts/testing/database-adapter.mjs'

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
  const database = databaseTestAdapter.openFile(databasePath)
  database.exec(
    readFileSync(
      join(process.cwd(), 'prisma/migrations/20260726000000_init/migration.sql'),
      'utf8',
    ),
  )
  database.exec(
    readFileSync(
      join(process.cwd(), 'prisma/migrations/20261108000000_add_word_state/migration.sql'),
      'utf8',
    ),
  )
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

  const seed = new PrismaClient()
  await seed.word_state.create({
    data: { userId: payload.user?.id ?? '', word: 'apple', known: true },
  })
  await seed.$disconnect()
})

it('[AC-ACCOUNT-003] returns the signed-in account word states', async () => {
  const response = await api.request('http://localhost/api/vocabulary/state', {
    headers: { cookie },
  })
  const body = await response.json()

  expect(body, '[AC-ACCOUNT-003] target signed-in body must include the stored word state').toEqual(
    { data: { activeBook: null, wordStates: [{ word: 'apple', known: true }] } },
  )

  rmSync(workspace, { recursive: true, force: true })
})
