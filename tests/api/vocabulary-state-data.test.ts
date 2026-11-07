import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { beforeAll, expect, it, vi } from 'vitest'
import { databaseTestAdapter } from '../../scripts/testing/database-adapter.mjs'

const workspace = mkdtempSync(join(tmpdir(), 'whitepaper-state-'))
const databasePath = join(workspace, 'state.db')
process.env.APP_ENV = 'test'
process.env.APP_URL = 'http://localhost:3000'
process.env.BETTER_AUTH_SECRET = 'vitest-only-secret-with-at-least-32-characters'
process.env.DATABASE_URL = databaseTestAdapter.isolatedUrl(databasePath)

vi.mock('server-only', () => ({}))

vi.mock('@/server/api/session', () => ({
  requireUserId: async () => 'user-a',
}))

type Api = (typeof import('@/server/api'))['default']

let api: Api

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

  const seed = new PrismaClient()
  await seed.user.create({
    data: { id: 'user-a', email: 'a@example.test', name: 'A' },
  })
  await seed.word_state.create({
    data: { userId: 'user-a', word: 'apple', known: true },
  })
  await seed.$disconnect()

  ;({ default: api } = await import('@/server/api'))
})

it('[AC-ACCOUNT-003] returns the signed-in account word states', async () => {
  const response = await api.request('http://localhost/api/vocabulary/state')
  const body = await response.json()

  expect(body, '[AC-ACCOUNT-003] target signed-in body must include the stored word state').toEqual(
    { data: { activeBook: null, wordStates: [{ word: 'apple', known: true }] } },
  )

  rmSync(workspace, { recursive: true, force: true })
})
