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
import { synthesizeSpeech } from '@/server/vocabulary/tts'
import { requireUserId } from '../../session'
import { zValidator } from '../../validator'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

const associationLinkSchema = z.object({
  word: z.string().trim().min(1),
  sentence: z.string().trim().min(1),
  audio: z.string().optional(),
  wordZh: z.string().trim().min(1).optional(),
  sentenceZh: z.string().trim().min(1).optional(),
  zh: z.string().optional(),
})

const associationNetworkSchema = z.object({
  target: z.string().trim().min(1),
  links: z.array(associationLinkSchema),
})

const associationsSchema = z.record(z.string(), associationNetworkSchema)

type AssociationNetwork = z.infer<typeof associationNetworkSchema>

let associationsCache: Record<string, AssociationNetwork> | null = null

function getAssociations(): Record<string, AssociationNetwork> {
  if (!associationsCache) {
    const file = join(process.cwd(), 'src/modules/vocabulary/data/associations.json')
    associationsCache = associationsSchema.parse(JSON.parse(readFileSync(file, 'utf8')))
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

const deskQuerySchema = z.object({
  bookId: z.string().trim().min(1).max(64),
})

const deskSchema = z
  .object({
    bookId: z.string().trim().min(1).max(64),
    payload: z.string().min(2).max(20_000_000),
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

const ttsQuerySchema = z
  .object({
    text: z.string().trim().min(1).max(300),
  })
  .strict()

const vocabulary = new Hono()
  .basePath('/vocabulary')
  .get('/tts', zValidator('query', ttsQuerySchema), async (c) => {
    const { text } = c.req.valid('query')

    try {
      const audio = await synthesizeSpeech(text)
      return c.body(new Uint8Array(audio), 200, {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      })
    } catch {
      return c.json({ code: 502, message: '语音生成失败' }, 502)
    }
  })
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
  .get('/desk', zValidator('query', deskQuerySchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)
    const { bookId } = c.req.valid('query')
    const desk = await prisma.vocabulary_desk.findUnique({
      where: { userId_bookId: { userId, bookId } },
    })

    return c.json({ data: { payload: desk?.payload ?? null, updatedAt: desk?.updatedAt ?? null } })
  })
  .put('/desk', zValidator('json', deskSchema), async (c) => {
    const userId = await requireUserId(c.req.raw.headers)
    const { bookId, payload } = c.req.valid('json')

    try {
      JSON.parse(payload)
    } catch {
      return c.json({ code: 400, message: 'payload 不是合法 JSON' }, 400)
    }

    const desk = await prisma.vocabulary_desk.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId, payload },
      update: { payload },
    })

    return c.json({ data: { updatedAt: desk.updatedAt } })
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
