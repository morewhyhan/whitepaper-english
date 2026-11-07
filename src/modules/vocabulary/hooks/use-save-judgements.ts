import { readApiJson } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'

export type JudgementInput = {
  judgements: { word: string; known: boolean }[]
}

type SavedState = {
  activeBook: null
  wordStates: { word: string; known: boolean }[]
}

export function useSaveJudgements() {
  return useMutation<SavedState, Error, JudgementInput>({
    mutationFn: async (input) => {
      const response = await fetch('/api/vocabulary/judgements', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
      })
      const payload = await readApiJson<{ data: SavedState }>(response)
      return payload.data
    },
  })
}
