/** Opções fixas de duração estimada (minutos) — alinhado com o backend. */
export const SERVICE_DURATION_CHOICES = [
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hora' },
  { minutes: 90, label: '1h30min' },
  { minutes: 120, label: '2h' },
] as const

export type ServiceDurationMinutes = (typeof SERVICE_DURATION_CHOICES)[number]['minutes']

const ALLOWED = new Set<number>(SERVICE_DURATION_CHOICES.map((c) => c.minutes))

export function formatServiceDuration(minutes: number): string {
  const row = SERVICE_DURATION_CHOICES.find((c) => c.minutes === minutes)
  return row?.label ?? `${minutes} min`
}

export function isAllowedServiceDuration(minutes: number): boolean {
  return ALLOWED.has(minutes)
}
