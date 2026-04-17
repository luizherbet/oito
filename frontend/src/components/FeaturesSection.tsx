export default function FeaturesSection() {
    return <div className="relative mx-auto max-w-6xl px-4 py-14">
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[2.5rem]"
  >
    <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
    <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
    <div className="absolute bottom-0 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
  </div>

  <header className="mx-auto mb-10 max-w-3xl text-center">
    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-950">
      Funcionalidades
    </p>
    <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-violet-300 sm:text-4xl">
      Um conjunto de ferramentas, com personalidades diferentes
    </h2>
    <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-gray-400">
      Cada peça resolve um problema concreto — sem parecer quatro vezes o mesmo cartão.
    </p>
  </header>

  {/* Bento: ritmo assimétrico + cartões com “variantes” */}
  <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
    {/* 1) Hero / editorial (ocupa topo inteiro) */}
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-7 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur-md lg:col-span-12">
      <div className="absolute right-6 top-6 select-none text-6xl font-semibold tabular-nums text-white/[0.06] transition group-hover:text-white/[0.09]">
        01
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-violet-200/90">Núcleo</p>
          <h3 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-white">
            Agenda automática
          </h3>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-gray-400">
            A tua disponibilidade e a duração de cada serviço definem as janelas certas.
            Menos idas e voltas no WhatsApp — mais horários preenchidos com quem realmente
            quer marcar contigo.
          </p>
        </div>
        <div className="lg:pt-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-gray-200/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
            Menos atrito no dia a dia
          </span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </article>

    {/* 2) Minimal / linha lateral (meia largura) */}
    <article className="relative rounded-3xl border border-white/10 bg-gray-950/35 p-7 lg:col-span-6">
      <div className="absolute inset-y-6 left-0 w-px bg-gradient-to-b from-sky-400/70 via-violet-400/35 to-transparent" />
      <div className="pl-5">
        <p className="text-xs font-medium text-sky-200/80">Fluxo</p>
        <h3 className="mt-2 text-balance text-lg font-semibold tracking-tight text-white">
          Link de agendamento
        </h3>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-gray-400">
          Um endereço, um fluxo: escolher serviço, dia e hora. Tu recebes o pedido pronto
          para confirmar — sem copiar horários à mão.
        </p>
      </div>
    </article>

    {/* 3) Glass / “cartão flutuante” (meia largura) */}
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-blue-950/25 p-7 shadow-[0_18px_60px_-34px_rgba(37,99,235,0.55)] backdrop-blur-md lg:col-span-6">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-sky-400/15 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-blue-100/80">Presença</p>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70 ring-1 ring-white/10">
            Showcase
          </span>
        </div>
        <h3 className="mt-3 text-balance text-lg font-semibold tracking-tight text-white">
          Portfólio integrado
        </h3>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-gray-300/90">
          Mostra o que sabes fazer ao pé do que ofereces. Quem te encontra entende o teu
          estilo antes de pedir a primeira marcação.
        </p>
      </div>
    </article>

    {/* 4) “Nota clínica” / contexto (largura total, estética diferente) */}
    <article className="rounded-3xl border border-white/10 bg-indigo-950/25 p-7 lg:col-span-12">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-medium text-indigo-100/80">Memória</p>
          <h3 className="mt-2 text-balance text-xl font-semibold tracking-tight text-white">
            Histórico do cliente
          </h3>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-gray-300/90">
            Volta a ver o último serviço, notas e preferências num sítio só. Cada visita
            fica com contexto — útil para recomendar o próximo passo com naturalidade.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-relaxed text-gray-300/90">
          <p className="font-medium text-white/90">Detalhe elegante (sem complicar)</p>
          <p className="mt-2 text-gray-400">
            Um mini-bloco lateral muda o ritmo visual e dá sensação de “produto completo”,
            não só texto em caixas.
          </p>
        </div>
      </div>
    </article>
  </div>
</div>
}