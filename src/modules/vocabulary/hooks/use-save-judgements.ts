import { client, readApiJson } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'

export type JudgementInput = {
  bookId: string
  date: string
  judgements: { word: string; known: boolean }[]
}

type SavedState = {
  activeBook: null
  wordStates: { word: string; known: boolean }[]
}

export function useSaveJudgements() {
  return useMutation<SavedState, Error, JudgementInput>({
    mutationFn: async (input) => {
      const response = await client.api.vocabulary.judgements.$post({ json: input })
      const payload = await readApiJson<{ data: SavedState }>(response)
      return payload.data
    },
  })
}
