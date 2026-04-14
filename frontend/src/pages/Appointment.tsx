import {useCallback, useEffect, useState} from 'react'
import type {FormEvent} from 'react'
import {Link, useSearchParams} from 'react-router-dom'
import {
    createAppointment,
    fetchIncomingAppointments,
    fetchMyAppointments,
} from '../api/appointment.ts'
import {fetchServicesByProfessional} from '../api/servicesPublic.ts'
import {useAuth} from '../context/AuthContext.tsx'
import type {AppointmentRead} from '../types/appointment.ts'
import type {ServiceItem} from '../types/ServiceItem.ts'
import type {ProfessionalHit, ServiceHit} from '../types/search.ts'
import SearchBar from '../components/Search.tsx'
import {ListAppointments} from "../components/ListAppointments.tsx";
import CardAppointment from "../components/CardAppointment.tsx";

function formatDateBr(iso: string): string {
    const [y, m, d] = iso.split('-')
    if (!y || !m || !d) return iso
    return `${d}/${m}/${y}`
}

function formatTimeShort(iso: string): string {
    return iso.length >= 5 ? iso.slice(0, 5) : iso
}

function timeToJson(t: string): string {
    const trimmed = t.trim()
    if (trimmed.length === 5) return `${trimmed}:00`
    return trimmed
}

type BookingPick = {
    professional_id: number
    professional_name: string
    service_id: number
    service_title: string
}

function pickFromServiceHit(h: ServiceHit): BookingPick {
    return {
        professional_id: h.professional_id,
        professional_name: h.professional_name,
        service_id: h.id,
        service_title: h.title,
    }
}

function pickFromServiceItem(
    s: ServiceItem,
    proId: number,
    proName: string,
): BookingPick {
    return {
        professional_id: proId,
        professional_name: proName,
        service_id: s.id,
        service_title: s.title,
    }
}

export default function Appointment() {
    const {user, loading: authLoading} = useAuth()
    const [searchParams] = useSearchParams()
    const [pick, setPick] = useState<BookingPick | null>(null)
    const [proCatalog, setProCatalog] = useState<{
        id: number
        name: string
        services: ServiceItem[]
    } | null>(null)
    const [catalogBusy, setCatalogBusy] = useState(false)
    const [appointmentDate, setAppointmentDate] = useState('')
    const [appointmentTime, setAppointmentTime] = useState('')
    const [notes, setNotes] = useState('')
    const [formError, setFormError] = useState<string | null>(null)
    const [formBusy, setFormBusy] = useState(false)
    const [mine, setMine] = useState<AppointmentRead[]>([])
    const [incoming, setIncoming] = useState<AppointmentRead[]>([])
    const [errMine, setErrMine] = useState<string | null>(null)
    const [errIncoming, setErrIncoming] = useState<string | null>(null)

    const loadLists = useCallback(async () => {
        if (!user) return
        setErrMine(null)
        setErrIncoming(null)
        try {
            setMine(await fetchMyAppointments())
        } catch (e) {
            setMine([])
            setErrMine(
                e instanceof Error ? e.message : 'Erro ao carregar os seus agendamentos como cliente.',
            )
        }
        if (user.is_professional) {
            try {
                setIncoming(await fetchIncomingAppointments())
            } catch (e) {
                setIncoming([])
                setErrIncoming(
                    e instanceof Error
                        ? e.message
                        : 'Erro ao carregar os pedidos recebidos como profissional.',
                )
            }
        } else {
            setIncoming([])
        }
    }, [user])

    useEffect(() => {
        if (!authLoading && user) void loadLists()
    }, [authLoading, user, loadLists])

    // Pré-seleção vinda da Home (ou de links) via querystring.
    useEffect(() => {
        if (!user) return
        const proIdStr = searchParams.get('professional_id')
        const proName = searchParams.get('professional_name') ?? ''
        const svcIdStr = searchParams.get('service_id')
        const svcTitle = searchParams.get('service_title') ?? ''
        const proId = proIdStr ? Number(proIdStr) : NaN
        const svcId = svcIdStr ? Number(svcIdStr) : NaN

        if (!Number.isFinite(proId)) return
        if (proId === user.id) {
            setFormError('Não pode marcar consigo próprio. Escolha outro profissional.')
            return
        }

        if (Number.isFinite(svcId)) {
            // Já veio com serviço selecionado.
            setPick({
                professional_id: proId,
                professional_name: proName || `Profissional #${proId}`,
                service_id: svcId,
                service_title: svcTitle || `Serviço #${svcId}`,
            })
            setProCatalog(null)
        } else {
            // Veio com profissional: carregar catálogo para escolher serviço.
            void handleBookingPick({
                type: 'professional',
                id: proId,
                name: proName || `Profissional #${proId}`,
                email: '',
                role: '',
            })
        }
        // Queremos reagir só a mudanças nos params, não a cada re-render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, user])

    const handleBookingPick = useCallback(
        async (hit: ProfessionalHit | ServiceHit) => {
            setFormError(null)
            if (hit.type === 'service') {
                setProCatalog(null)
                setCatalogBusy(false)
                setPick(pickFromServiceHit(hit))
                return
            }
            if (user && hit.id === user.id) {
                setPick(null)
                setProCatalog(null)
                setFormError('Não pode marcar consigo próprio. Escolha outro profissional.')
                return
            }
            setPick(null)
            setProCatalog(null)
            setCatalogBusy(true)
            try {
                const services = await fetchServicesByProfessional(hit.id)
                setProCatalog({id: hit.id, name: hit.name, services})
                if (services.length === 0) {
                    setFormError('Este profissional ainda não tem serviços disponíveis para agendar.')
                }
            } catch (e) {
                setFormError(
                    e instanceof Error ? e.message : 'Erro ao carregar serviços do profissional.',
                )
            } finally {
                setCatalogBusy(false)
            }
        },
        [user],
    )

    function selectServiceFromCatalog(s: ServiceItem) {
        if (!proCatalog) return
        setFormError(null)
        setPick(pickFromServiceItem(s, proCatalog.id, proCatalog.name))
        setProCatalog(null)
    }

    async function onBook(e: FormEvent) {
        e.preventDefault()
        setFormError(null)
        if (!user) return
        if (!pick) {
            setFormError('Escolha um serviço: pesquise e clique num serviço ou num profissional.')
            return
        }
        if (user.id === pick.professional_id) {
            setFormError('Não pode marcar consigo próprio.')
            return
        }
        if (!appointmentDate || !appointmentTime) {
            setFormError('Indique data e hora.')
            return
        }
        setFormBusy(true)
        try {
            await createAppointment({
                professional_id: pick.professional_id,
                service_id: pick.service_id,
                appointment_date: appointmentDate,
                appointment_time: timeToJson(appointmentTime),
                notes: notes.trim() || null,
            })
            setNotes('')
            setAppointmentTime('')
            setPick(null)
            await loadLists()
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Erro ao agendar.')
        } finally {
            setFormBusy(false)
        }
    }

    if (authLoading) {
        return <div className="text-slate-600">A carregar…</div>
    }

    if (!user) {
        return (
            <div className="max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <p className="mb-2">Precisa de sessão iniciada para marcar ou ver agendamentos.</p>
                <Link className="font-medium text-violet-800 underline" to="/login">
                    Entrar
                </Link>
            </div>
        )
    }

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-slate-900">Agendamentos</h1>
                <p className="text-sm text-slate-600">
                    Marque um serviço e acompanhe os seus pedidos.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ListAppointments/>


                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
                    <h2 className="mb-2 text-lg font-semibold text-slate-900">Novo agendamento</h2>
                    <p className="mb-4 text-sm text-slate-600">
                        Pesquise e clique num <strong>serviço</strong> para agendar, ou num{' '}
                        <strong>profissional</strong> para escolher o serviço.
                    </p>

                    <SearchBar
                        variant="booking"
                        className="w-full"
                        inputClassName="block w-full rounded-xl border border-slate-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-violet-900 focus:ring-violet-900"
                        onBookingPick={(hit) => void handleBookingPick(hit)}
                    />

                    {catalogBusy && (
                        <p className="mt-2 text-sm text-slate-500">A carregar serviços…</p>
                    )}

                    {proCatalog && proCatalog.services.length > 0 && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-sm font-semibold text-slate-800">
                                Serviços de {proCatalog.name}
                            </p>
                            <ul className="max-h-48 space-y-1 overflow-y-auto">
                                {proCatalog.services.map((s) => (
                                    <li key={s.id}>
                                        <button
                                            type="button"
                                            className="w-full rounded-xl border border-white bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:border-violet-400"
                                            onClick={() => selectServiceFromCatalog(s)}
                                        >
                                            <span className="font-medium">{s.title}</span>
                                            <span className="text-slate-600"> — R$ {Number(s.price).toFixed(2)}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form
                        onSubmit={onBook}
                        className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4"
                    >
                        {formError && (
                            <p className="text-sm text-red-600" role="alert">
                                {formError}
                            </p>
                        )}

                        {pick ? (
                            <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
                                <strong>Serviço:</strong> {pick.service_title} — <strong>Profissional:</strong>{' '}
                                {pick.professional_name}
                            </p>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Nenhum serviço selecionado. Pesquise e clique num resultado.
                            </p>
                        )}

                        <label className="flex flex-col gap-1 text-sm">
                            Data
                            <input
                                type="date"
                                required
                                className="rounded border border-slate-300 px-3 py-2"
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            Hora
                            <input
                                type="time"
                                required
                                className="rounded border border-slate-300 px-3 py-2"
                                value={appointmentTime}
                                onChange={(e) => setAppointmentTime(e.target.value)}
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            Notas (opcional)
                            <textarea
                                rows={2}
                                maxLength={2000}
                                className="rounded border border-slate-300 px-3 py-2"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={formBusy || !pick}
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                        >
                            {formBusy ? 'A enviar…' : 'Confirmar agendamento'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    )
}
