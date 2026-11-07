import { Hono } from 'hono'
import { requireUserId } from '../../session'

const vocabulary = new Hono()

vocabulary.get('/state', async (c) => {
  await requireUserId(c.req.raw.headers)

  return c.json({
    data: {
      activeBook: null,
      wordStates: [],
    },
  })
})

export default vocabulary
