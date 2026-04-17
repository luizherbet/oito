import { useEffect, useState } from 'react'
import { getStoredToken } from '../../api/auth.ts'
import NewService from '../../components/NewService.tsx'
import {
  SERVICE_DURATION_CHOICES,
  formatServiceDuration,
  isAllowedServiceDuration,
  type ServiceDurationMinutes,
} from '../../constants/serviceDuration.ts'
import type { ServiceItem } from '../../types/ServiceItem.ts'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getStoredToken() ?? ''}`,
})

export default function Services() {
  const [lista, setLista] = useState<ServiceItem[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState<ServiceItem | null>(null)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setCarregando(false)
      return
    }
    fetch('/api/v1/services/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`)
        return res.json()
      })
      .then((data: ServiceItem[]) => setLista(data))
      .catch(() => setErro('Não foi possível carregar os serviços.'))
      .finally(() => setCarregando(false))
  }, [])

  /** PUT — editar */
  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault()
    if (!editando) return
    const token = getStoredToken()
    if (!token) return

    const body = {
      title: editando.title,
      description: editando.description ?? '',
      price: Number(editando.price),
      estimated_minutes: editando.estimated_minutes,
    }

    const res = await fetch(`/api/v1/services/${editando.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(typeof data.detail === 'string' ? data.detail : 'Erro ao editar')
      return
    }
    const atualizado = data as ServiceItem
    setLista((prev) => prev.map((x) => (x.id === atualizado.id ? atualizado : x)))
    setEditando(null)
  }

  /** DELETE — soft delete; atualiza o card para “Inativo” */
  async function desativar(s: ServiceItem) {
    const token = getStoredToken()
    if (!token) return
    const res = await fetch(`/api/v1/services/${s.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(typeof data.detail === 'string' ? data.detail : 'Erro ao desativar')
      return
    }
    const atualizado = data as ServiceItem
    setLista((prev) => prev.map((x) => (x.id === s.id ? atualizado : x)))
  }

  /** DELETE — mesmo endpoint; remove o card da lista (UX “apagou”) */
  async function eliminar(s: ServiceItem) {
    const token = getStoredToken()
    if (!token) return
    const res = await fetch(`/api/v1/services/${s.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(typeof data.detail === 'string' ? data.detail : 'Erro ao eliminar')
      return
    }
    setLista((prev) => prev.filter((x) => x.id !== s.id))
  }

  if (carregando) return <div>Carregando…</div>
  if (erro) return <div>{erro}</div>

  return (
    <div className="flex min-w-[800px] flex-row justify-between">
      <h1 className="mb-4 text-xl font-semibold">Meus serviços</h1>
      <div className="flex">
        <ul className="space-y-2">
          {lista.map((s) => (
            <li
              key={s.id}
              className="group relative rounded border border-slate-200 p-3 pr-14"
            >
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  title="Editar"
                  onClick={() =>
                    setEditando({
                      ...s,
                      estimated_minutes: isAllowedServiceDuration(s.estimated_minutes)
                        ? s.estimated_minutes
                        : 60,
                    })
                  }
                >
                  ✏️
                </button>
                <button type="button" title="Desativar" onClick={() => desativar(s)}>
                  ⏸
                </button>
                <button type="button" title="Eliminar" onClick={() => eliminar(s)}>
                  🗑
                </button>
              </div>
              <strong>{s.title}</strong> — R$ {Number(s.price).toFixed(2)} —{' '}
              {formatServiceDuration(s.estimated_minutes)}
              <br />
              <span className="text-sm text-slate-600">{s.description}</span>
              <br />
              <span className="text-xs">{s.is_active ? 'Ativo' : 'Inativo'}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex">
        <NewService onCreated={(novo) => setLista((prev) => [...prev, novo])} />
      </div>

      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={salvarEdicao}
            className="w-full max-w-md rounded-lg bg-white p-4 shadow"
          >
            <h2 className="mb-2 font-semibold">Editar serviço</h2>
            <label className="block text-sm">
              Título
              <input
                className="mt-1 w-full border p-2"
                value={editando.title}
                onChange={(e) => setEditando({ ...editando, title: e.target.value })}
              />
            </label>
            <label className="mt-2 block text-sm">
              Descrição
              <input
                className="mt-1 w-full border p-2"
                value={editando.description ?? ''}
                onChange={(e) =>
                  setEditando({ ...editando, description: e.target.value })
                }
              />
            </label>
            <label className="mt-2 block text-sm">
              Preço
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full border p-2"
                value={editando.price}
                onChange={(e) =>
                  setEditando({ ...editando, price: Number(e.target.value) })
                }
              />
            </label>
            <label className="mt-2 block text-sm">
              Duração estimada
              <select
                className="mt-1 w-full border p-2"
                value={editando.estimated_minutes}
                onChange={(e) =>
                  setEditando({
                    ...editando,
                    estimated_minutes: Number(e.target.value) as ServiceDurationMinutes,
                  })
                }
              >
                {SERVICE_DURATION_CHOICES.map((c) => (
                  <option key={c.minutes} value={c.minutes}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
                Guardar
              </button>
              <button
                type="button"
                className="rounded border px-4 py-2"
                onClick={() => setEditando(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}