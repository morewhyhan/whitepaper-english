import { Hono } from 'hono'
import { z } from 'zod'
import { prisma } from '@/server/database/client'
import {
  clearWordStates,
  getDailySession,
  listWordStates,
  saveDailySession,
  setWordStates,
} from '@/server/vocabulary/store'
import { requireUserId } from '../../session'
import { zValidator } from '../../validator'

const judgementSchema = z
  .object({
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
    words: z.array(z.string().trim().min(1).max(120)).min(1).max(36),
  })
  .strict()

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

vocabulary.get('/state', async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const wordStates = await listWordStates(prisma, userId)

  return c.json({ data: { activeBook: null, wordStates } })
})

vocabulary.post('/judgements', zValidator('json', judgementSchema), async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const { judgements } = c.req.valid('json')

  await setWordStates(prisma, userId, judgements)
  const wordStates = await listWordStates(prisma, userId)

  return c.json({ data: { activeBook: null, wordStates } })
})

vocabulary.delete('/judgements', zValidator('json', clearSchema), async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const { words } = c.req.valid('json')

  await clearWordStates(prisma, userId, words)
  const wordStates = await listWordStates(prisma, userId)

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

export default vocabulary
