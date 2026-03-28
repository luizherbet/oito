import type { HealthResponse } from '../types/api'

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch('/health')
  if (!res.ok) throw new Error(`Health failed: ${res.status}`)
  return res.json() as Promise<HealthResponse>
}