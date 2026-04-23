export default function FeaturesSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          Funcionalidades
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Tudo o que o Oito precisa para ligar clientes e profissionais
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
          Uma experiência simples para agendar, organizar horários e acompanhar cada atendimento.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
        <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:col-span-12">


          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium text-slate-500">Nucleo</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Agenda automatica
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                O Oito ajuda a transformar disponibilidade em horarios prontos para marcar,
                reduzindo trocas de mensagem e deixando a agenda mais organizada.
              </p>
            </div>

            <div className="lg:pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Menos atrito no dia a dia
              </span>
            </div>
          </div>
        </article>

        <article className="relative rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm lg:col-span-6">
          <div className="pl-5">
            <p className="text-xs font-medium text-slate-500">Fluxo</p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
              Link de agendamento
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Um link simples para o cliente escolher servico, dia e hora, sem depender de
              conversa manual para cada novo pedido.
            </p>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm lg:col-span-6">
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-slate-500">Presenca</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Perfil
              </span>
            </div>

            <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
              Portfolio integrado
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              O profissional pode mostrar servicos e apresentar melhor o seu trabalho, ajudando
              o cliente a decidir com mais seguranca.
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-slate-900 p-7 shadow-sm lg:col-span-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium text-slate-400">Memoria</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                Historico do cliente
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Cada agendamento ajuda a construir contexto para os proximos atendimentos, com
                mais organizacao e continuidade para quem atende e para quem agenda.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 p-4 text-xs leading-relaxed text-slate-300">
              <p className="font-medium text-white">Feito para ser simples</p>
              <p className="mt-2 text-slate-400">
                O Oito junta descoberta, agendamento e acompanhamento num fluxo leve e direto.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}