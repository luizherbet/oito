import {useEffect, useState} from "react"
import {getStoredToken} from "../../api/auth.ts"
import NewService from "../../components/NewService.tsx"
import {
    SERVICE_DURATION_CHOICES,
    formatServiceDuration,
    isAllowedServiceDuration,
    type ServiceDurationMinutes,
} from "../../constants/serviceDuration.ts"
import type {ServiceItem} from "../../types/ServiceItem.ts"

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getStoredToken() ?? ""}`,
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

        fetch("/api/v1/services/me", {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Erro ${res.status}`)
                return res.json()
            })
            .then((data: ServiceItem[]) => setLista(data))
            .catch(() => setErro("Não foi possível carregar os serviços."))
            .finally(() => setCarregando(false))
    }, [])

    async function salvarEdicao(e: React.FormEvent) {
        e.preventDefault()
        if (!editando) return

        const token = getStoredToken()
        if (!token) return

        const body = {
            title: editando.title,
            description: editando.description ?? "",
            price: Number(editando.price),
            estimated_minutes: editando.estimated_minutes,
        }

        const res = await fetch(`/api/v1/services/${editando.id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
            alert(typeof data.detail === "string" ? data.detail : "Erro ao editar")
            return
        }

        const atualizado = data as ServiceItem
        setLista((prev) => prev.map((x) => (x.id === atualizado.id ? atualizado : x)))
        setEditando(null)
    }

    async function desativar(s: ServiceItem) {
        const token = getStoredToken()
        if (!token) return

        const res = await fetch(`/api/v1/services/${s.id}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${token}`},
        })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
            alert(typeof data.detail === "string" ? data.detail : "Erro ao desativar")
            return
        }

        const atualizado = data as ServiceItem
        setLista((prev) => prev.map((x) => (x.id === s.id ? atualizado : x)))
    }

    async function eliminar(s: ServiceItem) {
        const token = getStoredToken()
        if (!token) return

        const res = await fetch(`/api/v1/services/${s.id}`, {
            method: "DELETE",
            headers: {Authorization: `Bearer ${token}`},
        })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
            alert(typeof data.detail === "string" ? data.detail : "Erro ao eliminar")
            return
        }

        setLista((prev) => prev.filter((x) => x.id !== s.id))
    }

    if (carregando) {
        return <div className="mx-auto w-full max-w-6xl px-3 py-4 text-slate-600">Carregando…</div>
    }

    if (erro) {
        return <div className="mx-auto w-full max-w-6xl px-3 py-4 text-red-600">{erro}</div>
    }

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-4 sm:px-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-slate-900">Meus serviços</h1>
                <p className="text-sm text-slate-600">
                    Organize os serviços que você oferece e mantenha seu catálogo atualizado.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <section
                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-sm sm:p-5">
                    <div className="mb-4 border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-semibold text-slate-900">Serviços cadastrados</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Edite, desative ou remova um serviço quando precisar.
                        </p>
                    </div>

                    {lista.length === 0 ? (
                        <p className="text-sm text-slate-500">Nenhum serviço cadastrado.</p>
                    ) : (
                        <ul className="space-y-3">
                            {lista.map((s) => (
                                <li
                                    key={s.id}
                                    className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
                                >
                                    <div
                                        className="absolute right-3 top-3 flex gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
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
                                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            type="button"
                                            title="Desativar"
                                            onClick={() => desativar(s)}
                                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                                        >
                                            ⏸
                                        </button>

                                        <button
                                            type="button"
                                            title="Eliminar"
                                            onClick={() => eliminar(s)}
                                            className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                        >
                                            🗑
                                        </button>
                                    </div>

                                    <div className="pr-24">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <strong className="text-slate-900">{s.title}</strong>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                                    s.is_active
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                        {s.is_active ? "Ativo" : "Inativo"}
                      </span>
                                        </div>

                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                            {s.description || "Sem descrição."}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">
                        R$ {Number(s.price).toFixed(2)}
                      </span>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1">
                        {formatServiceDuration(s.estimated_minutes)}
                      </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
                <NewService onCreated={(novo) => setLista((prev) => [...prev, novo])}/>

            </div>

            {editando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-3">
                    <form
                        onSubmit={salvarEdicao}
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
                    >
                        <div className="mb-4 border-b border-slate-200 pb-3">
                            <h2 className="text-lg font-semibold text-slate-900">Editar serviço</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Atualize os dados do serviço selecionado.
                            </p>
                        </div>

                        <label className="block text-sm text-slate-700">
                            Título
                            <input
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                                value={editando.title}
                                onChange={(e) => setEditando({...editando, title: e.target.value})}
                            />
                        </label>

                        <label className="mt-3 block text-sm text-slate-700">
                            Descrição
                            <input
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                                value={editando.description ?? ""}
                                onChange={(e) =>
                                    setEditando({...editando, description: e.target.value})
                                }
                            />
                        </label>

                        <label className="mt-3 block text-sm text-slate-700">
                            Preço
                            <input
                                type="number"
                                step="0.01"
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
                                value={editando.price}
                                onChange={(e) =>
                                    setEditando({...editando, price: Number(e.target.value)})
                                }
                            />
                        </label>

                        <label className="mt-3 block text-sm text-slate-700">
                            Duração estimada
                            <select
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
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

                        <div className="mt-5 flex gap-2">
                            <button
                                type="submit"
                                className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
                            >
                                Guardar
                            </button>
                            <button
                                type="button"
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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