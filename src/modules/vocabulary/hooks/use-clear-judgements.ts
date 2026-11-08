import { client, readApiJson } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'

export type ClearJudgementsInput = {
  bookId: string
  date: string
  words: string[]
}

type ClearedState = {
  activeBook: null
  wordStates: { word: string; known: boolean }[]
}

export function useClearJudgements() {
  return useMutation<ClearedState, Error, ClearJudgementsInput>({
    mutationFn: async (input) => {
      const response = await client.api.vocabulary.judgements.$delete({ json: input })
      const payload = await readApiJson<{ data: ClearedState }>(response)
      return payload.data
    },
  })
}
