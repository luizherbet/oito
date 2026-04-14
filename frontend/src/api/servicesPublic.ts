import type { ServiceItem } from '../types/ServiceItem.ts'

export async function fetchServicesByProfessional(
  professionalId: number,
): Promise<ServiceItem[]> {
  const res = await fetch(
    `/api/v1/services/by-professional/${professionalId}`,
  )
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { detail?: unknown }
    const msg =
      typeof data.detail === 'string' ? data.detail : `Erro ${res.status}`
    throw new Error(msg)
  }
  return res.json() as Promise<ServiceItem[]>
}
