import { client, readApiJson } from '@/lib/api-client'
import { useMutation, useQuery } from '@tanstack/react-query'

export type DailySessionPayload = {
  round: number
  cursor: number
  ids: string[]
  missed: string[]
  history: { round: number; total: number; missed: number }[]
  complete: boolean
}

export type DailySessionData = {
  bookId: string
  date: string
  session: DailySessionPayload | null
}

export function useDailySession(bookId: string, date: string, enabled: boolean) {
  return useQuery<DailySessionData>({
    queryKey: ['vocabulary-session', bookId, date],
    enabled,
    queryFn: async () => {
      const response = await client.api.vocabulary.session.$get({ query: { bookId, date } })
      const payload = await readApiJson<{ data: { session: DailySessionPayload | null } }>(response)
      return { bookId, date, session: payload.data.session }
    },
  })
}

export function useSaveDailySession() {
  return useMutation({
    mutationFn: async ({
      bookId,
      date,
      session,
    }: {
      bookId: string
      date: string
      session: DailySessionPayload
    }) => {
      const response = await client.api.vocabulary.session.$put({
        json: { bookId, date, ...session },
      })
      const payload = await readApiJson<{ data: { session: DailySessionPayload } }>(response)
      return payload.data.session
    },
  })
}
