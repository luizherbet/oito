import {useEffect, useState} from "react"
import {useParams} from "react-router-dom"
import AboutProfessional from "../components/AboutProfessional"
import ListService from "../components/ListService"
import {fetchServicesByProfessional} from "../api/servicesPublic"
import type {UserRead} from "../types/user"
import type {ServiceItem} from "../types/ServiceItem"
import {useNavigate} from "react-router-dom"

export default function Profile() {
    const {professionalId} = useParams<{ professionalId: string }>()
    const id = professionalId ? Number(professionalId) : NaN

    const [professional, setProfessional] = useState<UserRead | null>(null)
    const [services, setServices] = useState<ServiceItem[]>([])
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [loadingServices, setLoadingServices] = useState(true)
    const [errorProfile, setErrorProfile] = useState<string | null>(null)
    const [errorServices, setErrorServices] = useState<string | null>(null)

    useEffect(() => {
        if (!Number.isFinite(id)) {
            setProfessional(null)
            setServices([])
            setErrorProfile("ID de profissional inválido.")
            setErrorServices(null)
            setLoadingProfile(false)
            setLoadingServices(false)
            return
        }

        let alive = true

        async function loadProfile() {
            setLoadingProfile(true)
            setErrorProfile(null)
            try {
                const res = await fetch(`/api/v1/users/${id}`)
                if (res.status === 404) {
                    if (!alive) return
                    setProfessional(null)
                    setErrorProfile("Profissional não encontrado.")
                    return
                }
                if (!res.ok) {
                    const data = (await res.json().catch(() => ({}))) as { detail?: unknown }
                    const msg =
                        typeof data.detail === "string" ? data.detail : `Erro ${res.status}`
                    throw new Error(msg)
                }
                const data = (await res.json()) as UserRead
                if (!alive) return
                setProfessional(data)
            } catch (e) {
                if (!alive) return
                setProfessional(null)
                setErrorProfile(e instanceof Error ? e.message : "Erro ao carregar o perfil.")
            } finally {
                if (alive) setLoadingProfile(false)
            }
        }

        async function loadServices() {
            setLoadingServices(true)
            setErrorServices(null)
            try {
                const list = await fetchServicesByProfessional(id)
                if (!alive) return
                setServices(list.filter((s) => s.is_active))
            } catch (e) {
                if (!alive) return
                setServices([])
                setErrorServices(
                    e instanceof Error ? e.message : "Erro ao carregar serviços.",
                )
            } finally {
                if (alive) setLoadingServices(false)
            }
        }

        void loadProfile()
        void loadServices()

        return () => {
            alive = false
        }
    }, [id])

    const loading = loadingProfile || loadingServices
    const pageError = errorProfile

    const navigate = useNavigate()

    function onPickService(s: ServiceItem) {
        if (!professional) return
        const params = new URLSearchParams({
            professional_id: String(professional.id),
            professional_name: professional.name,
            service_id: String(s.id),
            service_title: s.title,
        })
        navigate(`/appointment?${params.toString()}`)
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-slate-900">Perfil</h1>
                <p className="text-sm text-slate-600">
                    Dados públicos e serviços deste profissional.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <AboutProfessional
                    professional={professional}
                    loading={loadingProfile}
                    error={errorProfile}
                />
                <ListService
                    title="Serviços"
                    services={services}
                    onPick={onPickService}
                    emptyText={
                        professional && !professional.is_professional
                            ? "Este utilizador não é um profissional."
                            : "Nenhum serviço disponível."
                    }
                />
            </div>

            {errorServices && !pageError && (
                <p className="text-sm text-red-600">{errorServices}</p>
            )}
        </div>
    )
}