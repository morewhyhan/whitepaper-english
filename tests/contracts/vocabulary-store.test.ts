import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { databaseTestAdapter } from '../../scripts/testing/database-adapter.mjs'
import { listWordStates, setWordState } from '@/server/vocabulary/store'

const workspace = mkdtempSync(join(tmpdir(), 'whitepaper-store-'))
const databasePath = join(workspace, 'store.db')
const databaseUrl = databaseTestAdapter.isolatedUrl(databasePath)

let prisma: PrismaClient

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

  prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } })
  await prisma.user.createMany({
    data: [
      { id: 'user-a', email: 'a@example.test', name: 'A' },
      { id: 'user-b', email: 'b@example.test', name: 'B' },
    ],
  })

  await setWordState(prisma, 'user-a', 'apple', true)
  await setWordState(prisma, 'user-b', 'tree', false)
})

afterAll(async () => {
  await prisma.$disconnect()
  rmSync(workspace, { recursive: true, force: true })
})

it('[AC-ACCOUNT-002] isolates word states by account', async () => {
  const userA = await listWordStates(prisma, 'user-a')
  const userB = await listWordStates(prisma, 'user-b')

  expect(
    { userA, userB },
    '[AC-ACCOUNT-002] target each account sees only its own word states',
  ).toEqual({
    userA: [{ word: 'apple', known: true }],
    userB: [{ word: 'tree', known: false }],
  })
})
