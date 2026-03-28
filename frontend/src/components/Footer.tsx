export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">

        {/* Branding + proposta */}
        <div>
          <h2 className="text-white text-lg font-semibold mb-4">
            Oito
          </h2>
          <p className="text-sm leading-relaxed">
            A Oito é uma plataforma de agendamento para profissionais
            independentes que querem organizar sua rotina, reduzir faltas
            e automatizar atendimentos. Transformamos agendas caóticas
            em processos simples, digitais e eficientes.
          </p>
        </div>

        {/* Proposta de valor */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Por que usar a Oito
          </h3>
          <ul className="space-y-2 text-sm">
            <li>• Agendamento online 24/7</li>
            <li>• Lembretes automáticos (WhatsApp)</li>
            <li>• Página de agendamento personalizada</li>
            <li>• Gestão de clientes e histórico</li>
            <li>• Redução de faltas e cancelamentos</li>
          </ul>
        </div>

        {/* Público alvo */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Para quem é
          </h3>
          <ul className="space-y-2 text-sm">
            <li>• Psicólogos e terapeutas</li>
            <li>• Barbeiros e esteticistas</li>
            <li>• Personal trainers</li>
            <li>• Professores e consultores</li>
            <li>• Prestadores de serviço</li>
          </ul>
        </div>

        {/* Navegação */}
        <div>
          <h3 className="text-white font-semibold mb-4">
            Navegação
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-white transition">
                Início
              </a>
            </li>
            <li>
              <a href="/como-funciona" className="hover:text-white transition">
                Como funciona
              </a>
            </li>
            <li>
              <a href="/precos" className="hover:text-white transition">
                Preços
              </a>
            </li>
            <li>
              <a href="/contato" className="hover:text-white transition">
                Contato
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Linha inferior */}
      <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Oito. Simplificando o agendamento profissional.
      </div>
    </footer>
  );
}