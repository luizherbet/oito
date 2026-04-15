import { useAuth } from "../context/AuthContext"

export default function AboutMe() {
  const { user, loading } = useAuth()

  if (loading) return <div className="text-slate-600">A carregar…</div>

  if (!user) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="border-b border-slate-100 p-2 text-lg font-semibold text-slate-900 text-center">
          Sobre mim
        </h2>
        <p className="mt-4 text-sm text-slate-600">Precisa de sessão iniciada.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="border-b border-slate-100 p-2 text-lg font-semibold text-slate-900 text-center">
        Sobre mim
      </h2>

      <div className="mt-4 space-y-2 text-sm">
        <p className="text-slate-900">
          <span className="font-medium">Nome:</span> {user.name}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Email:</span> {user.email}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Cidade:</span> {user.city}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Telefone:</span> {user.phone}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Perfil:</span>{" "}
          {user.is_professional ? "Profissional" : "Cliente"}
        </p>
      </div>
    </section>
  )
}