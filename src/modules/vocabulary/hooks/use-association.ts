import { client, readApiJson } from '@/lib/api-client'
import type { AssociationNetwork } from '../lib/vocabulary'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

type BatchResponse = { data: { networks: Record<string, AssociationNetwork | null> } }

async function fetchAssociations(words: string[]) {
  const response = await client.api.vocabulary.associations.$get({
    query: { words: words.join(',') },
  })
  const payload = await readApiJson<BatchResponse>(response)
  return payload.data.networks
}

export function useAssociations(words: string[], chunkKey: string) {
  return useQuery<Record<string, AssociationNetwork | null>>({
    queryKey: ['vocabulary-associations', chunkKey],
    enabled: words.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: () => fetchAssociations(words),
  })
}

export function usePrefetchAssociations(words: string[], chunkKey: string) {
  const queryClient = useQueryClient()
  const signature = words.join('|')

  useEffect(() => {
    if (!words.length) return
    void queryClient.prefetchQuery({
      queryKey: ['vocabulary-associations', chunkKey],
      queryFn: () => fetchAssociations(words),
      staleTime: Number.POSITIVE_INFINITY,
    })
    // words is represented by its stable signature.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, chunkKey, signature])
}
