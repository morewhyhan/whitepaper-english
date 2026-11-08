import { Hono } from 'hono'
import { z } from 'zod'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { prisma } from '@/server/database/client'
import {
  clearWordStates,
  getDailySession,
  listDailyHistory,
  listWordStates,
  resetBookDay,
  saveDailySession,
  setWordStates,
} from '@/server/vocabulary/store'
import { requireUserId } from '../../session'
import { zValidator } from '../../validator'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

type AssociationNetwork = {
  target: string
  links: { word: string; sentence: string }[]
}

let associationsCache: Record<string, AssociationNetwork> | null = null

function getAssociations(): Record<string, AssociationNetwork> {
  if (!associationsCache) {
    const file = join(process.cwd(), 'src/modules/vocabulary/data/associations.json')
    associationsCache = JSON.parse(readFileSync(file, 'utf8')) as Record<string, AssociationNetwork>
  }

  return associationsCache
}

function localDate() {
  return new Date().toISOString().slice(0, 10)
}

const judgementSchema = z
  .object({
    bookId: z.string().trim().min(1).max(64).optional(),
    date: z.string().regex(datePattern).optional(),
    judgements: z
      .array(
        z
          .object({
            word: z.string().trim().min(1).max(120),
            known: z.boolean(),
          })
          .strict(),
      )
      .min(1)
      .max(36),
  })
  .strict()

const clearSchema = z
  .object({
    bookId: z.string().trim().min(1).max(64).optional(),
    date: z.string().regex(datePattern).optional(),
    words: z.array(z.string().trim().min(1).max(120)).min(1).max(36),
  })
  .strict()

const historyQuerySchema = z
  .object({
    bookId: z.string().trim().min(1).max(64).optional(),
    days: z.coerce.number().int().min(1).max(365).optional(),
  })
  .strict()

const resetSchema = z
  .object({
    bookId: z.string().trim().min(1).max(64).optional(),
    date: z.string().regex(datePattern).optional(),
  })
  .strict()

const stateQuerySchema = z.object({
  bookId: z.string().trim().min(1).max(64).optional(),
  date: z.string().regex(datePattern).optional(),
})

const sessionQuerySchema = z
  .object({
    bookId: z.string().trim().min(1).max(64),
    date: z.string().regex(datePattern),
  })
  .strict()

const sessionSchema = z
  .object({
    bookId: z.string().trim().min(1).max(64),
    date: z.string().regex(datePattern),
    round: z.number().int().min(1),
    cursor: z.number().int().min(0),
    ids: z.array(z.string()).max(10_000),
    missed: z.array(z.string()).max(10_000),
    history: z
      .array(
        z
          .object({
            round: z.number().int(),
            total: z.number().int(),
            missed: z.number().int(),
          })
          .strict(),
      )
      .max(1_000),
    complete: z.boolean(),
  })
  .strict()

const associationQuerySchema = z
  .object({
    word: z.string().trim().min(1).max(120),
  })
  .strict()

const associationBatchQuerySchema = z
  .object({
    words: z.string().trim().min(1).max(3000),
  })
  .strict()

const vocabulary = new Hono()
  .basePath('/vocabulary')
  .get('/associations', zValidator('query', associationBatchQuerySchema), async (c) => {
    const words = c.req
      .valid('query')
      .words.split(',')
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 36)
    const all = getAssociations()
    const networks: Record<string, AssociationNetwork | null> = {}

    for (const word of words) networks[word] = all[word] ?? null

    return c.json({ data: { networks } })
  })
  .get('/association', zValidator('query', associationQuerySchema), async (c) => {
    const { word } = c.req.valid('query')
    const network = getAssociations()[word.toLowerCase()] ?? null

    return c.json({ data: { network } })
  })
  .get('/state', zValidator('query', stateQuerySchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)
    const { bookId = 'parallel-world', date = localDate() } = c.req.valid('query')
    const wordStates = await listWordStates(prisma, userId, bookId, date)

    return c.json({ data: { activeBook: null, wordStates } })
  })
  .post('/judgements', zValidator('json', judgementSchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)
    const { bookId = 'parallel-world', date = localDate(), judgements } = c.req.valid('json')

    await setWordStates(prisma, userId, bookId, date, judgements)
    const wordStates = await listWordStates(prisma, userId, bookId, date)

    return c.json({ data: { activeBook: null, wordStates } })
  })
  .delete('/judgements', zValidator('json', clearSchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)
    const { bookId = 'parallel-world', date = localDate(), words } = c.req.valid('json')

    await clearWordStates(prisma, userId, words, bookId, date)
    const wordStates = await listWordStates(prisma, userId, bookId, date)

    return c.json({ data: { activeBook: null, wordStates } })
  })
  .get('/session', zValidator('query', sessionQuerySchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)
    const { bookId, date } = c.req.valid('query')
    const session = await getDailySession(prisma, userId, bookId, date)

    return c.json({ data: { session } })
  })
  .put('/session', zValidator('json', sessionSchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)
    const { bookId, date, ...session } = c.req.valid('json')
    const saved = await saveDailySession(prisma, userId, bookId, date, session)

    return c.json({ data: { session: saved } })
  })
  .post('/reset', zValidator('json', resetSchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)
    const { bookId = 'parallel-world', date = localDate() } = c.req.valid('json')

    await resetBookDay(prisma, userId, bookId, date)

    return c.json({ data: { reset: true } })
  })
  .get('/history', zValidator('query', historyQuerySchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)
    const { bookId = 'parallel-world', days = 30 } = c.req.valid('query')
    const history = await listDailyHistory(prisma, userId, bookId, days)

    return c.json({ data: { history } })
  })

export default vocabulary
