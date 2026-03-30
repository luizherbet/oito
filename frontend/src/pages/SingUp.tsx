import {FormEvent, useState} from 'react'

type FormState = {
    name: string
    email: string
    zipcode: string
    city: string
    address: string
    phone: string
    password: string
    confirmPassword: string
    is_professional: boolean
    role: string
}

const initial: FormState = {
    name: '',
    email: '',
    zipcode: '',
    city: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: '',
    is_professional: false,
    role: '',
}

export default function SingUp() {
    const [form, setForm] = useState<FormState>(initial)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    function update<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((f) => ({...f, [key]: value}))
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)

        if (form.password !== form.confirmPassword) {
            setError('As palavras-passe não coincidem.')
            return
        }
        if (form.password.length < 6) {
            setError('A palavra-passe deve ter pelo menos 6 caracteres.')
            return
        }

        setLoading(true)
        try {

            const res = await fetch('/api/v1/users/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    zipcode: form.zipcode.trim(),
                    city: form.city.trim(),
                    address: form.address.trim(),
                    phone: form.phone.trim(),
                    password: form.password,
                    is_professional: form.is_professional,
                    role: form.role,
                }),
            })

            const data = await res.json().catch(() => ({}))

            if (res.status === 409) {
                setError(
                    typeof data.detail === 'string'
                        ? data.detail
                        : 'Este email já está registado.',
                )
                return
            }
            if (!res.ok) {
                setError(
                    typeof data.detail === 'string'
                        ? data.detail
                        : `Erro ao registar (${res.status}).`,
                )
                return
            }

            setSuccess(true)
            setForm(initial)
        } catch {
            setError('Não foi possível ligar ao servidor.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="container mx-auto max-w-md px-4 py-8">
                <p className="rounded-lg bg-green-50 p-4 text-green-800">
                    Conta criada com sucesso. Já podes entrar.
                </p>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-md px-4 py-8">
            <h1 className="mb-6 text-2xl font-semibold text-slate-900">Cadastre-se</h1>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                {error && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                        {error}
                    </p>
                )}

                <label className="flex flex-col gap-1 text-sm">
                    Nome
                    <input
                        required
                        className="rounded border border-slate-300 px-3 py-2"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    Email
                    <input
                        type="email"
                        required
                        className="rounded border border-slate-300 px-3 py-2"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    CEP
                    <input
                        required
                        className="rounded border border-slate-300 px-3 py-2"
                        value={form.zipcode}
                        onChange={(e) => update('zipcode', e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    Cidade
                    <input
                        required
                        className="rounded border border-slate-300 px-3 py-2"
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    Endereço
                    <input
                        required
                        className="rounded border border-slate-300 px-3 py-2"
                        value={form.address}
                        onChange={(e) => update('address', e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    Telefone
                    <input
                        required
                        className="rounded border border-slate-300 px-3 py-2"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    Senha
                    <input
                        type="password"
                        required
                        autoComplete="new-password"
                        className="rounded border border-slate-300 px-3 py-2"
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    Confirmar senha
                    <input
                        type="password"
                        required
                        autoComplete="new-password"
                        className="rounded border border-slate-300 px-3 py-2"
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                    />
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.is_professional}
                        onChange={(e) => update('is_professional', e.target.checked)}
                    />
                    Sou profissional (vou prestar serviços na OitO)
                </label>
                {form.is_professional ?
                    <label className="flex flex-col gap-1 text-sm">
                        Ocupação
                        <input
                            className="rounded border border-slate-300 px-3 py-2"
                            value={form.role}
                            onChange={(e) => update('role', e.target.value)}
                        />
                    </label> : null
                }

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                    Criar conta
                </button>
            </form>
        </div>
    )
}