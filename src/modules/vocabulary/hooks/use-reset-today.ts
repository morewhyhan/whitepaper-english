import { client, readApiJson } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'

export function useResetToday() {
  return useMutation({
    mutationFn: async ({ bookId, date }: { bookId: string; date: string }) => {
      const response = await client.api.vocabulary.reset.$post({ json: { bookId, date } })
      return readApiJson<{ data: { reset: boolean } }>(response)
    },
  })
}
