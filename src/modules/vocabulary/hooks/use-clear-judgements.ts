import { readApiJson } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'

export type ClearJudgementsInput = {
  words: string[]
}

type ClearedState = {
  activeBook: null
  wordStates: { word: string; known: boolean }[]
}

export function useClearJudgements() {
  return useMutation<ClearedState, Error, ClearJudgementsInput>({
    mutationFn: async (input) => {
      const response = await fetch('/api/vocabulary/judgements', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      })
      const payload = await readApiJson<{ data: ClearedState }>(response)
      return payload.data
    },
  })
}
