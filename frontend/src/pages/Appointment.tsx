import { Link } from "react-router-dom"
import CreateAppointment from "../components/CreateAppointment.tsx"
import { ListAppointments } from "../components/ListAppointments.tsx"
import { useAuth } from "../context/AuthContext.tsx"
import { useState } from "react"

export default function Appointment() {
  const { user, loading: authLoading } = useAuth()
  const [listVersion, setListVersion] = useState(0)

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
        <ListAppointments key={listVersion} />
        <CreateAppointment onCreated={() => setListVersion((v) => v + 1)} />
      </div>
    </div>
  )
}