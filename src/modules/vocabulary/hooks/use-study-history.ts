import { client, readApiJson } from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'

export type StudyHistoryDay = {
  date: string
  words: number
  known: number
  unknown: number
  rounds: number
  complete: boolean
}

export function useStudyHistory(bookId: string, days: number, enabled: boolean) {
  return useQuery<StudyHistoryDay[]>({
    queryKey: ['vocabulary-history', bookId, days],
    enabled,
    queryFn: async () => {
      const response = await client.api.vocabulary.history.$get({
        query: { bookId, days: String(days) },
      })
      const payload = await readApiJson<{ data: { history: StudyHistoryDay[] } }>(response)
      return payload.data.history
    },
  })
}
