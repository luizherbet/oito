import {useState} from 'react'
import type {FormEvent} from 'react'
import {getStoredToken} from '../api/auth.ts'
import {
    SERVICE_DURATION_CHOICES,
    type ServiceDurationMinutes,
} from '../constants/serviceDuration.ts'
import type {ServiceItem} from '../types/ServiceItem.ts'

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
    title: '',
    description: '',
    price: '',
    estimated_minutes: 60,
    is_active: true,
}


export default function NewService({onCreated}: Props) {
    const [form, setForm] = useState<FormState>(initial)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((f) => ({...f, [key]: value}))
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        try {

            const res = await fetch('/api/v1/services/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
                    typeof data.detail === 'string'
                        ? data.detail
                        : `Erro ao registar (${res.status}).`,
                )
                return
            }

            onCreated?.(data)
            setForm(initial)
        } catch {
            setError('Não foi possível ligar ao servidor.')
        } finally {
            setLoading(false)
        }
    }

    return (<div
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm w-[300px]">
        <p className="border-b border-slate-100 mb-2 text-center"> Crie um serviço</p>
        <form onSubmit={onSubmit}>
            {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}
            <label className="flex p-1 flex-col gap-1 text-sm">
                Título
                <input
                    required
                    className="rounded border border-slate-300 px-3 py-2"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                />
            </label>
            <label className="flex flex-col p-1 gap-1 text-sm">
                Descrição
                <input
                    required
                    className="rounded border border-slate-300 px-3 py-2"
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                />
            </label>
            <label className="flex flex-col p-1 gap-1 text-sm">
                Preço
                <input
                    required
                    className="rounded border border-slate-300 px-3 py-2"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                />
            </label>
            <label className="flex flex-col gap-1 p-2 text-sm">
                Duração estimada
                <select
                    required
                    className="rounded border border-slate-300 px-3 py-2"
                    value={form.estimated_minutes}
                    onChange={(e) =>
                        update(
                            'estimated_minutes',
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
                className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
            >
                Criar serviço
            </button>
        </form></div>)
}