import type { UserRead } from '../types/user'

const TOKEN_KEY = 'access_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token === null) localStorage.removeItem(TOKEN_KEY)
  else localStorage.setItem(TOKEN_KEY, token)
}

export async function loginRequest(email: string, password: string): Promise<string> {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; detail?: unknown }
  if (!res.ok) {
    const msg =
      typeof data.detail === 'string' ? data.detail : `Erro ao entrar (${res.status})`
    throw new Error(msg)
  }
  if (!data.access_token) throw new Error('Resposta inválida do servidor.')
  return data.access_token
}

export async function fetchMe(token: string): Promise<UserRead> {
  const res = await fetch('/api/v1/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Sessão inválida.')
  return res.json() as Promise<UserRead>
}