import type { UserRead } from "../types/user"

type Props = {
  professional: UserRead | null
  loading: boolean
  error: string | null
}

export default function AboutMe({ professional, loading, error }: Props) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="border-b border-slate-100 p-2 text-lg font-semibold text-slate-900 text-center">
          Sobre o profissional
        </h2>
        <p className="mt-4 text-sm text-slate-600">A carregar…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="border-b border-slate-100 p-2 text-lg font-semibold text-slate-900 text-center">
          Sobre o profissional
        </h2>
        <p className="mt-4 text-sm text-red-600">{error}</p>
      </section>
    )
  }

  if (!professional) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="border-b border-slate-100 p-2 text-lg font-semibold text-slate-900 text-center">
          Sobre o profissional
        </h2>
        <p className="mt-4 text-sm text-slate-600">Perfil não encontrado.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="border-b border-slate-100 p-2 text-lg font-semibold text-slate-900 text-center">
        Sobre o profissional
      </h2>

      <div className="mt-4 space-y-2 text-sm">
        <p className="text-slate-900">
          <span className="font-medium">Nome:</span> {professional.name}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Email:</span> {professional.email}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Cidade:</span> {professional.city}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Telefone:</span> {professional.phone}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Morada:</span> {professional.address}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Código postal:</span> {professional.zipcode}
        </p>
        <p className="text-slate-900">
          <span className="font-medium">Função:</span> {professional.role}
        </p>
        {!professional.is_professional && (
          <p className="mt-2 text-sm text-amber-800">
            Esta conta não está marcada como profissional.
          </p>
        )}
      </div>
    </section>
  )
}