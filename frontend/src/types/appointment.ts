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
export type UserMini = {
    id: number
    name: string
}

export type ServiceMini = {
    id: number
    title: string
}

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
    client: UserMini
    professional: UserMini
    service: ServiceMini
}
