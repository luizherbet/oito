import type { ServiceDurationMinutes } from '../constants/serviceDuration.ts'

export type ServiceItem = {
  id: number
  professional_id: number
  title: string
  description: string | null
  price: number
  estimated_minutes: ServiceDurationMinutes
  is_active: boolean
  created_at: string
  updated_at: string
}