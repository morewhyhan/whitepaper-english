import { client, readApiJson } from '@/lib/api-client'
import type { AssociationNetwork } from '../lib/vocabulary'
import { useQuery } from '@tanstack/react-query'

export function useAssociation(word: string) {
  return useQuery<AssociationNetwork | null>({
    queryKey: ['vocabulary-association', word],
    enabled: Boolean(word),
    queryFn: async () => {
      const response = await client.api.vocabulary.association.$get({ query: { word } })
      const payload = await readApiJson<{ data: { network: AssociationNetwork | null } }>(response)
      return payload.data.network
    },
  })
}
