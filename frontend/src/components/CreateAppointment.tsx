import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import { createAppointment } from "../api/appointment.ts"
import { fetchServicesByProfessional } from "../api/servicesPublic.ts"
import SearchBar from "./Search.tsx"
import { useAuth } from "../context/AuthContext.tsx"
import type { AppointmentRead } from "../types/appointment.ts"
import type { ServiceItem } from "../types/ServiceItem.ts"

type BookingPick = {
  professional_id: number
  professional_name: string
  service_id: number
  service_title: string
}

type ProfessionalHit = {
  type: "professional"
  id: number
  name: string
  email: string
  role: string
}

type ServiceHit = {
  type: "service"
  id: number
  title: string
  professional_id: number
  professional_name: string
}

type SearchHit = ProfessionalHit | ServiceHit

type Props = {
  onCreated?: (appointment: AppointmentRead) => void
}

function timeToJson(t: string): string {
  const trimmed = t.trim()
  if (trimmed.length === 5) return `${trimmed}:00`
  return trimmed
}

function formatDateBr(iso: string): string {
  const [y, m, d] = iso.split("-")
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

function formatTimeShort(iso: string): string {
  return iso.length >= 5 ? iso.slice(0, 5) : iso
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

export default function CreateAppointment({ onCreated }: Props) {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  const [pick, setPick] = useState<BookingPick | null>(null)
  const [proCatalog, setProCatalog] = useState<{
    id: number
    name: string
    services: ServiceItem[]
  } | null>(null)

  const [catalogBusy, setCatalogBusy] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [notes, setNotes] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [formBusy, setFormBusy] = useState(false)
  const [createdAppointment, setCreatedAppointment] =
    useState<AppointmentRead | null>(null)

  const handleBookingPick = useCallback(
    async (hit: SearchHit) => {
      setCreatedAppointment(null)
      setFormError(null)

      if (hit.type === "service") {
        setProCatalog(null)
        setCatalogBusy(false)
        setPick(pickFromServiceHit(hit))
        return
      }

      if (user && hit.id === user.id) {
        setPick(null)
        setProCatalog(null)
        setFormError("Não pode marcar consigo próprio. Escolha outro profissional.")
        return
      }

      setPick(null)
      setProCatalog(null)
      setCatalogBusy(true)

      try {
        const services = await fetchServicesByProfessional(hit.id)
        setProCatalog({ id: hit.id, name: hit.name, services })

        if (services.length === 0) {
          setFormError(
            "Este profissional ainda não tem serviços disponíveis para agendar.",
          )
        }
      } catch (e) {
        setFormError(
          e instanceof Error
            ? e.message
            : "Erro ao carregar serviços do profissional.",
        )
      } finally {
        setCatalogBusy(false)
      }
    },
    [user],
  )

  useEffect(() => {
    if (!user) return

    const proIdStr = searchParams.get("professional_id")
    const proName = searchParams.get("professional_name") ?? ""
    const svcIdStr = searchParams.get("service_id")
    const svcTitle = searchParams.get("service_title") ?? ""

    const proId = proIdStr ? Number(proIdStr) : NaN
    const svcId = svcIdStr ? Number(svcIdStr) : NaN

    if (!Number.isFinite(proId)) return

    setCreatedAppointment(null)
    setFormError(null)

    if (proId === user.id) {
      setFormError("Não pode marcar consigo próprio. Escolha outro profissional.")
      return
    }

    if (Number.isFinite(svcId)) {
      setPick({
        professional_id: proId,
        professional_name: proName || `Profissional #${proId}`,
        service_id: svcId,
        service_title: svcTitle || `Serviço #${svcId}`,
      })
      setProCatalog(null)
      return
    }

    void handleBookingPick({
      type: "professional",
      id: proId,
      name: proName || `Profissional #${proId}`,
      email: "",
      role: "",
    })
  }, [searchParams, user, handleBookingPick])

  function selectServiceFromCatalog(s: ServiceItem) {
    if (!proCatalog) return
    setCreatedAppointment(null)
    setFormError(null)
    setPick(pickFromServiceItem(s, proCatalog.id, proCatalog.name))
    setProCatalog(null)
  }

  async function onBook(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    if (!user) return

    if (!pick) {
      setFormError(
        "Escolha um serviço: pesquise e clique num serviço ou num profissional.",
      )
      return
    }

    if (user.id === pick.professional_id) {
      setFormError("Não pode marcar consigo próprio.")
      return
    }

    if (!appointmentDate || !appointmentTime) {
      setFormError("Indique data e hora.")
      return
    }

    setFormBusy(true)

    try {
      const created = await createAppointment({
        professional_id: pick.professional_id,
        service_id: pick.service_id,
        appointment_date: appointmentDate,
        appointment_time: timeToJson(appointmentTime),
        notes: notes.trim() || null,
      })

      setCreatedAppointment(created)
      setPick(null)
      setProCatalog(null)
      setAppointmentDate("")
      setAppointmentTime("")
      setNotes("")
      onCreated?.(created)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao agendar.")
    } finally {
      setFormBusy(false)
    }
  }

  function handleNewAppointment() {
    setCreatedAppointment(null)
    setFormError(null)
    setPick(null)
    setProCatalog(null)
    setAppointmentDate("")
    setAppointmentTime("")
    setNotes("")
  }

  return (
    <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-slate-900">
        Novo agendamento
      </h2>
      <p className="mb-4 text-sm text-slate-600">
        Pesquise e clique num <strong>serviço</strong> para agendar, ou num{" "}
        <strong>profissional</strong> para escolher o serviço.
      </p>

      {!createdAppointment && (
        <>
          <SearchBar
            variant="booking"
            className="w-full"
            inputClassName="block w-full rounded-xl border border-slate-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-violet-900 focus:ring-violet-900"
            onBookingPick={(hit: SearchHit) => void handleBookingPick(hit)}
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
                      <span className="text-slate-600">
                        {" "}
                        — R$ {Number(s.price).toFixed(2)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
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

        {createdAppointment ? (
          <>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <p className="font-semibold">Agendamento feito com sucesso.</p>
              <p className="mt-1">
                <strong>Serviço:</strong> {createdAppointment.service.title}
              </p>
              <p>
                <strong>Profissional:</strong>{" "}
                {createdAppointment.professional.name}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {formatDateBr(createdAppointment.appointment_date)}
              </p>
              <p>
                <strong>Hora:</strong>{" "}
                {formatTimeShort(createdAppointment.appointment_time)}
              </p>
              {createdAppointment.notes && (
                <p>
                  <strong>Notas:</strong> {createdAppointment.notes}
                </p>
              )}
              <p>
                <strong>Estado:</strong> {createdAppointment.status}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNewAppointment}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-sm hover:bg-slate-800"
            >
              Novo agendamento
            </button>
          </>
        ) : (
          <>
            {pick ? (
              <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
                <strong>Serviço:</strong> {pick.service_title} —{" "}
                <strong>Profissional:</strong> {pick.professional_name}
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
                type="select"
                step={1800}
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
              {formBusy ? "A enviar…" : "Confirmar agendamento"}
            </button>
          </>
        )}
      </form>
    </section>
  )
}