import { useState } from 'react'

const DIAS = [
  { dow: 0, label: 'Dom' },
  { dow: 1, label: 'Seg' },
  { dow: 2, label: 'Ter' },
  { dow: 3, label: 'Qua' },
  { dow: 4, label: 'Qui' },
  { dow: 5, label: 'Sex' },
  { dow: 6, label: 'Sáb' },
]

/** Horas cheias, ex.: 8h às 17h — ajusta o intervalo se quiseres */
const HORAS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
function celulaId(dow: number, h: number) {
  return `${dow}-${String(h).padStart(2, '0')}:00`
}

export default function Schedule() {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())

  function alternar(id: string) {
    setSelecionadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="overflow-x-auto rounded border border-slate-200 bg-white p-2">
      <table className="w-full min-w-[560px] border-collapse text-center text-sm">
        <thead>
          <tr>
            <th className="border-b border-slate-200 bg-slate-50 p-2 text-left">Hora</th>
            {DIAS.map((d) => (
              <th key={d.dow} className="border-b border-slate-200 bg-slate-50 p-2">
                {d.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HORAS.map((h) => (
            <tr key={h}>
              <td className="border-b border-slate-100 bg-slate-50 p-2 text-left text-slate-600">
                {String(h).padStart(2, '0')}:00
              </td>
              {DIAS.map((d) => {
                const id = celulaId(d.dow, h)
                const ativo = selecionadas.has(id)
                return (
                  <td key={id} className="border-b border-slate-100 p-0">
                    <button
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => alternar(id)}
                      className={`h-10 w-full text-xs ${
                        ativo
                          ? 'bg-violet-600 text-white'
                          : 'bg-white text-slate-300 hover:bg-violet-50'
                      }`}
                    >
                      {ativo ? '✓' : '·'}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}