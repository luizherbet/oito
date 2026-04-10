import {useEffect, useState} from 'react'
import {getStoredToken} from '../../api/auth.ts'
import Service from "../../components/Service.tsx";
// isso deveria estar em types
type ServiceItem = {
    id: number
    professional_id: number
    title: string
    description: string | null
    price: number
    is_active: boolean
}
//
export default function Services() {
    const [lista, setLista] = useState<ServiceItem[]>([])
    const [erro, setErro] = useState<string | null>(null)
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
        const token = getStoredToken()
        if (!token) {
            setErro('Faça login.')
            setCarregando(false)
            return
        }

        fetch('/api/v1/services/me', {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Erro ${res.status}`)
                return res.json()
            })
            .then((data: ServiceItem[]) => setLista(data))
            .catch(() => setErro('Não foi possível carregar os serviços.'))
            .finally(() => setCarregando(false))
    }, [])

    if (carregando) return <div>Carregando…</div>
    if (erro) return <div>{erro}</div>
    if (lista.length === 0) return <div>Nenhum serviço ainda.</div>

    return (
        <div className="flex flex-row justify-between min-w-[800px]">
            <h1 className="mb-4 text-xl font-semibold">Meus serviços</h1>
            <div className="flex">
                <ul className="space-y-2">
                    {lista.map((s) => (
                        <li key={s.id} className="rounded border border-slate-200 p-3">
                            <strong>{s.title}</strong> — R$ {Number(s.price).toFixed(2)}
                            <br/>
                            <span className="text-sm text-slate-600">{s.description}</span>
                            <br/>
                            <span className="text-xs">{s.is_active ? 'Ativo' : 'Inativo'}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex">
                <Service
                    onCreated={(novo) => {
                        setLista((prev) => [...prev, novo])
                    }}
                />
            </div>

        </div>
    )
}