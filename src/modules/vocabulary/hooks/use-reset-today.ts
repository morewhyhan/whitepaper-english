import { readApiJson } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'

export function useResetToday() {
  return useMutation({
    mutationFn: async ({ bookId, date }: { bookId: string; date: string }) => {
      const response = await fetch('/api/vocabulary/reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookId, date }),
      })
      return readApiJson<{ data: { reset: boolean } }>(response)
    },
  })
}
