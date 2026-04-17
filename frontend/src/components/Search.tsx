import {useEffect, useState} from "react"
import type {SearchResponse} from "../types/search"
import {Link} from "react-router-dom";

export default function Search() {
    const [q, setQ] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [results, setResults] = useState<SearchResponse[]>([])

    useEffect(() => {
        const term = q.trim()
        if (term.length < 2) {
            setResults([])
            setError(null)
            return
        }

        const controller = new AbortController()
        const t = window.setTimeout(async () => {
            try {
                setLoading(true)
                setError(null)

                const res = await fetch(`/api/v1/search?q=${encodeURIComponent(term)}`, {
                    signal: controller.signal,
                })

                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const data = (await res.json()) as SearchResponse[]
                setResults(data)
            } catch (e: any) {
                if (e?.name !== "AbortError") setError(e?.message ?? "Erro na busca")
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => {
            controller.abort()
            window.clearTimeout(t)
        }
    }, [q])

    return (
        <div className="w-full max-w-2xl">
            <label className="block text-sm font-medium text-slate-700">Buscar</label>
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Digite para buscar um serviço ou um profissional"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
            />

            <div className="mt-3">
                {loading && <p className="text-sm text-slate-500">Buscando...</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}

                {!loading && !error && results.length === 0 && q.trim().length >= 2 && (
                    <p className="text-sm text-slate-500">Nenhum resultado.</p>
                )}

                <ul className="mt-3 space-y-3">
                    {results.map((prof) => {
                        const maxServices = 3
                        const serviceTitles = prof.services.map((s) => s.title)
                        const shown = serviceTitles.slice(0, maxServices)
                        const hasMore = serviceTitles.length > maxServices

                        // Perfil ainda não existe (placeholder)
                        const href = "#"

                        return (
                            <li key={prof.id}>
                                <Link
                                    to={`/profile/${prof.id}`}
                                    className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-[1px] hover:border-violet-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-300"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <strong className="truncate text-slate-900">{prof.name}</strong>
                                                <span
                                                    className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
          {prof.role}
        </span>
                                            </div>

                                            <p className="mt-1 truncate text-sm text-slate-600">
                                                {shown.join(", ")}
                                                {hasMore ? "…" : ""}
                                            </p>
                                        </div>

                                        <span
                                            className="shrink-0 text-sm font-medium text-violet-600 transition group-hover:translate-x-0.5">
      Ver perfil →
    </span>
                                    </div>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}