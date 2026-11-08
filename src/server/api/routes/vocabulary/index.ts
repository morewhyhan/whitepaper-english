import { Hono } from 'hono'
import { z } from 'zod'
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
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict()

const sessionSchema = z
  .object({
    bookId: z.string().trim().min(1).max(64),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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

const vocabulary = new Hono().basePath('/vocabulary')

vocabulary.get('/state', zValidator('query', stateQuerySchema), async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const { bookId = 'parallel-world', date = localDate() } = c.req.valid('query')
  const wordStates = await listWordStates(prisma, userId, bookId, date)

  return c.json({ data: { activeBook: null, wordStates } })
})

vocabulary.post('/judgements', zValidator('json', judgementSchema), async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const { bookId = 'parallel-world', date = localDate(), judgements } = c.req.valid('json')

  await setWordStates(prisma, userId, bookId, date, judgements)
  const wordStates = await listWordStates(prisma, userId, bookId, date)

  return c.json({ data: { activeBook: null, wordStates } })
})

vocabulary.delete('/judgements', zValidator('json', clearSchema), async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const { bookId = 'parallel-world', date = localDate(), words } = c.req.valid('json')

  await clearWordStates(prisma, userId, words, bookId, date)
  const wordStates = await listWordStates(prisma, userId, bookId, date)

  return c.json({ data: { activeBook: null, wordStates } })
})

vocabulary.get('/session', zValidator('query', sessionQuerySchema), async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const { bookId, date } = c.req.valid('query')
  const session = await getDailySession(prisma, userId, bookId, date)

  return c.json({ data: { session } })
})

vocabulary.put('/session', zValidator('json', sessionSchema), async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const { bookId, date, ...session } = c.req.valid('json')
  const saved = await saveDailySession(prisma, userId, bookId, date, session)

  return c.json({ data: { session: saved } })
})

vocabulary.post('/reset', zValidator('json', resetSchema), async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const { bookId = 'parallel-world', date = localDate() } = c.req.valid('json')

  await resetBookDay(prisma, userId, bookId, date)

  return c.json({ data: { reset: true } })
})

vocabulary.get('/history', zValidator('query', historyQuerySchema), async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const { bookId = 'parallel-world', days = 30 } = c.req.valid('query')
  const history = await listDailyHistory(prisma, userId, bookId, days)

  return c.json({ data: { history } })
})

export default vocabulary
