export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'

/** Corpo para POST /api/v1/appointments/ */
export type AppointmentCreate = {
  professional_id: number
  service_id: number
  appointment_date: string
  appointment_time: string
  notes?: string | null
}

/** Resposta da API (datas/horas em ISO string). */
export type AppointmentRead = {
  id: number
  client_id: number
  professional_id: number
  service_id: number
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
  updated_at: string
  client_name: string
  professional_name: string
  service_title: string
}
