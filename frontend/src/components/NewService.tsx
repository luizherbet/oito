import { useState } from "react"
import type { FormEvent } from "react"
import { getStoredToken } from "../api/auth.ts"
import {
  SERVICE_DURATION_CHOICES,
  type ServiceDurationMinutes,
} from "../constants/serviceDuration.ts"
import type { ServiceItem } from "../types/ServiceItem.ts"

type Props = {
  onCreated?: (novo: ServiceItem) => void
}

type FormState = {
  title: string
  description: string
  price: string
  estimated_minutes: ServiceDurationMinutes
  is_active: boolean
}

const initial: FormState = {
  title: "",
  description: "",
  price: "",
  estimated_minutes: 60,
  is_active: true,
}

export default function NewService({ onCreated }: Props) {
  const [form, setForm] = useState<FormState>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/v1/services/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getStoredToken()}`,
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price.trim()),
          estimated_minutes: form.estimated_minutes,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(
          typeof data.detail === "string"
            ? data.detail
            : `Erro ao registar (${res.status}).`,
        )
        return
      }

      onCreated?.(data as ServiceItem)
      setForm(initial)
    } catch {
      setError("Não foi possível ligar ao servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-violet-50/40 p-4 shadow-sm sm:p-5">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <h2 className="text-lg font-semibold text-slate-900">Novo serviço</h2>
        <p className="mt-1 text-sm text-slate-600">
          Adicione um novo serviço ao seu perfil profissional.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Título
          <input
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Descrição
          <textarea
            required
            rows={3}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Preço
          <input
            required
            type="number"
            step="0.01"
            min="0"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Duração estimada
          <select
            required
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
            value={form.estimated_minutes}
            onChange={(e) =>
              update(
                "estimated_minutes",
                Number(e.target.value) as ServiceDurationMinutes,
              )
            }
          >
            {SERVICE_DURATION_CHOICES.map((c) => (
              <option key={c.minutes} value={c.minutes}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-50"
        >
          {loading ? "A criar..." : "Criar serviço"}
        </button>
      </form>
    </section>
  )
}