import { Hono } from 'hono'
import { prisma } from '@/server/database/client'
import { listWordStates } from '@/server/vocabulary/store'
import { requireUserId } from './session'

const vocabulary = new Hono()

vocabulary.get('/state', async (c) => {
  const userId = await requireUserId(c.req.raw.headers)
  const wordStates = await listWordStates(prisma, userId)

  return c.json({
    data: {
      activeBook: null,
      wordStates,
    },
  })
})

export default vocabulary
