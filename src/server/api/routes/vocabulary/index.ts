import { Hono } from 'hono'
import { z } from 'zod'
import { prisma } from '@/server/database/client'
import { listWordStates, setWordStates } from '@/server/vocabulary/store'
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

const vocabulary = new Hono()

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

export default vocabulary
