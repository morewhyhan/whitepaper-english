import { client, readApiJson } from '@/lib/api-client'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { VocabularySession, VocabularyState } from '../lib/vocabulary'

export type DeskPayload = {
  state: VocabularyState
  undoStack: VocabularySession[]
  undoDate?: string
}

export function useVocabularyDesk(bookId: string, userId: string | undefined) {
  return useQuery<DeskPayload | null>({
    queryKey: ['vocabulary-desk', userId, bookId],
    enabled: Boolean(userId),
    staleTime: 0,
    queryFn: async () => {
      const response = await client.api.vocabulary.desk.$get({ query: { bookId } })
      const payload = await readApiJson<{ data: { payload: string | null } }>(response)
      if (!payload.data.payload) return null
      return JSON.parse(payload.data.payload) as DeskPayload
    },
  })
}

export function useSaveVocabularyDesk() {
  return useMutation({
    mutationFn: async ({ bookId, payload }: { bookId: string; payload: DeskPayload }) => {
      const response = await client.api.vocabulary.desk.$put({
        json: { bookId, payload: JSON.stringify(payload) },
      })
      await readApiJson<{ data: { updatedAt: string } }>(response)
    },
  })
}
