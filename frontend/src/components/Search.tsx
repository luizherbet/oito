import {useEffect, useState} from 'react'
import {fetchSearch} from '../api/search.ts'
import type {SearchResponse} from '../types/search'

export default function SearchBar() {
    const [term, setTerm] = useState('')
    const [results, setResults] = useState<SearchResponse['results']>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const q = term.trim()

        if (q.length > 2) {
            const t = setTimeout(async () => {
                try {
                    setError(null)
                    const data = await fetchSearch(q)
                    setResults(data.results)
                } catch (e) {
                    setError('Não foi possível buscar.')
                    setResults([])
                }
            }, 400)

            return () => clearTimeout(t)
        }

    }, [term])

    return (
        <div>
            <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Digite para buscar profissionais ou serviços..."
                className='block w-[350px] p-4 ps-5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-violet-900 focus:border-violet-900'
            />

            {error && <p>{error}</p>}

            <ul>
                {results.map((item) =>
                    item.type === 'professional' ? (
                        <li key={`p-${item.id}`}>{item.name}</li>
                    ) : (
                        <li key={`s-${item.id}`}>
                            {item.title} — {item.professional_name}
                        </li>
                    ),
                )}
            </ul>
        </div>
    )
}

//e nao existir valor para a busca deveria aparecer nenhum resultado encontrado para sua busca ou algo do tipo