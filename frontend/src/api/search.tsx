import type { SearchResponse } from '../components/Search'

export async function fetchSearch(q: string, limit = 20): Promise<SearchResponse> {
  const params = new URLSearchParams({ q, limit: String(limit) })
  const res = await fetch(`/api/v1/search?${params.toString()}`)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json() as Promise<SearchResponse>
}