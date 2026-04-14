import { useEffect, useState } from 'react'
import { fetchSearch } from '../api/search.ts'
import type { SearchResponse } from '../types/search.ts'

type Variant = 'default' | 'booking'

type Props = {
  className?: string
  inputClassName?: string
  variant?: Variant
  /** Quando `variant="booking"`, chamado ao clicar num profissional ou serviço. */
  onBookingPick?: (hit: SearchResponse['results'][number]) => void
}

export default function SearchBar({
  className = '',
  inputClassName = "block w-[350px] p-4 ps-5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-violet-900 focus:border-violet-900",
  variant = 'default',
  onBookingPick,
}: Props) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<SearchResponse['results']>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = term.trim()

    if (q.length < 3) {
      setResults([])
      setError(null)
      return
    }

    const t = setTimeout(() => {
      void (async () => {
        try {
          setError(null)
          const data = await fetchSearch(q)
          setResults(data.results)
        } catch {
          setError('Não foi possível buscar.')
          setResults([])
        }
      })()
    }, 400)

    return () => clearTimeout(t)
  }, [term])

  const booking = variant === 'booking' && onBookingPick

  return (
    <div className={className}>
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Digite para buscar profissionais ou serviços..."
        className={inputClassName}
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {term.trim().length >= 3 && !error && results.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">
          Nenhum resultado encontrado para a sua pesquisa.
        </p>
      )}

      <ul
        className={
          variant === 'booking'
            ? 'mt-3 max-h-64 space-y-2 overflow-y-auto pr-1'
            : 'mt-2 space-y-1'
        }
      >
        {results.map((item) =>
          item.type === 'professional' ? (
            <li key={`p-${item.id}`}>
              {booking ? (
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-violet-400 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  onClick={() => onBookingPick(item)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500">Profissional</div>
                    </div>
                    <span className="text-xs font-medium text-violet-700">Agendar</span>
                  </div>
                </button>
              ) : (
                <span className="text-sm">{item.name}</span>
              )}
            </li>
          ) : (
            <li key={`s-${item.id}`}>
              {booking ? (
                <button
                  type="button"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-violet-400 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  onClick={() => onBookingPick(item)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-600">{item.professional_name}</div>
                      <div className="text-xs text-slate-500">Serviço</div>
                    </div>
                    <span className="text-xs font-medium text-violet-700">Agendar</span>
                  </div>
                </button>
              ) : (
                <span className="text-sm">
                  {item.title} — {item.professional_name}
                </span>
              )}
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
