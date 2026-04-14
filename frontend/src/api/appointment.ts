import { getStoredToken } from './auth.ts'
import type { AppointmentCreate, AppointmentRead } from '../types/appointment.ts'

function authHeaders(): HeadersInit {
  const token = getStoredToken()
  if (!token) throw new Error('Não autenticado.')
  return { Authorization: `Bearer ${token}` }
}

function authJsonHeaders(): HeadersInit {
  return {
    ...authHeaders(),
    'Content-Type': 'application/json',
  }
}

export async function fetchMyAppointments(): Promise<AppointmentRead[]> {
  const res = await fetch('/api/v1/appointments/me', {
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { detail?: unknown }
    const msg =
      typeof data.detail === 'string' ? data.detail : `Erro ${res.status}`
    throw new Error(msg)
  }
  return res.json() as Promise<AppointmentRead[]>
}

export async function fetchIncomingAppointments(): Promise<AppointmentRead[]> {
  const res = await fetch('/api/v1/appointments/incoming', {
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { detail?: unknown }
    const msg =
      typeof data.detail === 'string' ? data.detail : `Erro ${res.status}`
    throw new Error(msg)
  }
  return res.json() as Promise<AppointmentRead[]>
}

export async function createAppointment(
  body: AppointmentCreate,
): Promise<AppointmentRead> {
  const res = await fetch('/api/v1/appointments/', {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(body),
  })
  const data = (await res.json().catch(() => ({}))) as {
    detail?: unknown
  } & Partial<AppointmentRead>
  if (!res.ok) {
    const msg =
      typeof data.detail === 'string' ? data.detail : `Erro ${res.status}`
    throw new Error(msg)
  }
  return data as AppointmentRead
}
