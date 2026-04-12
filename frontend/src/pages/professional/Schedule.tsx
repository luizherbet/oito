import { useCallback, useEffect, useState } from 'react'
import { getStoredToken, fetchMe } from '../../api/auth.ts'

const DIAS = [
  { dow: 0, label: 'Dom' },
  { dow: 1, label: 'Seg' },
  { dow: 2, label: 'Ter' },
  { dow: 3, label: 'Qua' },
  { dow: 4, label: 'Qui' },
  { dow: 5, label: 'Sex' },
  { dow: 6, label: 'Sáb' },
]

const HORAS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

type ScheduleRead = {
  id: number
  professional_id: number
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

function celulaId(dow: number, h: number) {
  return `${dow}-${String(h).padStart(2, '0')}:00`
}

/** Uma hora cheia h ocupa [h:00, (h+1):00) — cruza com [start, end] vindo da API */
function intervaloParaCelulas(dow: number, startStr: string, endStr: string): string[] {
  const [sh, sm = 0, ss = 0] = startStr.split(':').map(Number)
  const [eh, em = 0, es = 0] = endStr.split(':').map(Number)
  const startSec = sh * 3600 + sm * 60 + ss
  const endSec = eh * 3600 + em * 60 + es
  const ids: string[] = []
  for (const h of HORAS) {
    const slotStart = h * 3600
    const slotEnd = (h + 1) * 3600
    if (startSec < slotEnd && endSec > slotStart) {
      ids.push(celulaId(dow, h))
    }
  }
  return ids
}

function selecionadasParaBlocos(selecionadas: Set<string>) {
  const porDia = new Map<number, number[]>()

  for (const id of selecionadas) {
    const m = /^(\d+)-(\d{2}):00$/.exec(id)
    if (!m) continue
    const dow = Number(m[1])
    const hour = Number(m[2])
    if (dow < 0 || dow > 6) continue
    const arr = porDia.get(dow) ?? []
    arr.push(hour)
    porDia.set(dow, arr)
  }

  const blocos: { day_of_week: number; start_time: string; end_time: string }[] = []

  for (const [dow, horas] of porDia) {
    horas.sort((a, b) => a - b)
    let i = 0
    while (i < horas.length) {
      let j = i
      while (j + 1 < horas.length && horas[j + 1] === horas[j] + 1) j++
      const h0 = horas[i]
      const h1 = horas[j]
      let endH = h1 + 1
      if (endH > 22) endH = 22
      const start = `${String(h0).padStart(2, '0')}:00:00`
      const end = `${String(endH).padStart(2, '0')}:00:00`
      if (start < end) {
        blocos.push({ day_of_week: dow, start_time: start, end_time: end })
      }
      i = j + 1
    }
  }

  return blocos
}

export default function Schedule() {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())
  const [professionalId, setProfessionalId] = useState<number | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setProfessionalId(null)
      return
    }
    fetchMe(token)
      .then((u) => {
        if (u.is_professional) setProfessionalId(u.id)
        else setProfessionalId(null)
      })
      .catch(() => setProfessionalId(null))
  }, [])

  const carregarAgenda = useCallback(async () => {
    const token = getStoredToken()
    if (!token || professionalId == null) return
    setCarregando(true)
    setMensagem(null)
    try {
      const res = await fetch('/api/v1/schedules/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = (await res.json().catch(() => [])) as ScheduleRead[] | { detail?: unknown }
      if (!res.ok) {
        const detail = !Array.isArray(data) && typeof data.detail === 'string' ? data.detail : null
        throw new Error(detail ?? `Erro ao carregar (${res.status})`)
      }
      const rows = Array.isArray(data) ? data : []
      const next = new Set<string>()
      for (const row of rows) {
        if (!row.is_active) continue
        for (const id of intervaloParaCelulas(row.day_of_week, row.start_time, row.end_time)) {
          next.add(id)
        }
      }
      setSelecionadas(next)
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Erro ao carregar agenda.')
    } finally {
      setCarregando(false)
    }
  }, [professionalId])

  useEffect(() => {
    if (professionalId != null) void carregarAgenda()
  }, [professionalId, carregarAgenda])

  const alternar = useCallback((id: string) => {
    setSelecionadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setMensagem(null)
  }, [])

  async function guardarAgenda() {
    const token = getStoredToken()
    if (!token) {
      setMensagem('Inicia sessão para guardar.')
      return
    }
    if (professionalId == null) {
      setMensagem('A carregar perfil… ou conta não é de profissional.')
      return
    }

    const blocos = selecionadasParaBlocos(selecionadas)

    setSalvando(true)
    setMensagem(null)

    try {
      const res = await fetch('/api/v1/schedules/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intervals: blocos.map((b) => ({
            day_of_week: b.day_of_week,
            start_time: b.start_time,
            end_time: b.end_time,
          })),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as ScheduleRead[] | { detail?: unknown }
      if (!res.ok) {
        const msg =
          typeof data === 'object' &&
          data !== null &&
          'detail' in data &&
          typeof (data as { detail?: unknown }).detail === 'string'
            ? (data as { detail: string }).detail
            : `Erro ao guardar (${res.status})`
        throw new Error(msg)
      }
      setMensagem(blocos.length === 0 ? 'Agenda limpa.' : 'Horário guardado.')
      await carregarAgenda()
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Erro ao guardar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-1">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Disponibilidade semanal</h1>
        <p className="text-sm text-slate-500">
          Toca nas células para marcar ou desmarcar. Guardar sincroniza com o servidor.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void guardarAgenda()}
          disabled={salvando || carregando || professionalId == null}
          className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45"
        >
          {salvando ? 'A guardar…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => void carregarAgenda()}
          disabled={carregando || professionalId == null}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45"
        >
          {carregando ? 'A carregar…' : 'Recarregar'}
        </button>
        {mensagem && (
          <p role="status" className="text-sm font-medium text-slate-600">
            {mensagem}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-center text-sm">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/90">
                <th
                  scope="col"
                  className="sticky left-0 z-20 border-b border-slate-200/90 py-3.5 pl-5 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Hora
                </th>
                {DIAS.map((d) => (
                  <th
                    key={d.dow}
                    scope="col"
                    className={`border-b border-slate-200/90 px-2 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-600 ${
                      d.dow === 0 || d.dow === 6 ? 'bg-violet-50/50 text-violet-800' : ''
                    }`}
                  >
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {HORAS.map((h) => (
                <tr
                  key={h}
                  className="transition-colors odd:bg-white even:bg-slate-50/40 hover:bg-violet-50/30"
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 whitespace-nowrap border-b border-slate-100 bg-inherit py-1 pl-5 pr-4 text-left text-xs font-medium tabular-nums text-slate-500"
                  >
                    <span className="inline-flex min-w-[3rem] items-center rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 tabular-nums">
                      {String(h).padStart(2, '0')}:00
                    </span>
                  </th>
                  {DIAS.map((d) => {
                    const id = celulaId(d.dow, h)
                    const ativo = selecionadas.has(id)
                    const fimDeSemana = d.dow === 0 || d.dow === 6
                    return (
                      <td
                        key={id}
                        className={`border-b border-slate-100 p-0.5 ${fimDeSemana ? 'bg-violet-50/20' : ''}`}
                      >
                        <button
                          type="button"
                          aria-pressed={ativo}
                          aria-label={
                            ativo
                              ? `Desmarcar ${d.label} às ${String(h).padStart(2, '0')}:00`
                              : `Marcar ${d.label} às ${String(h).padStart(2, '0')}:00`
                          }
                          onClick={() => alternar(id)}
                          className={`flex h-9 w-full min-w-[2rem] items-center justify-center rounded-md text-xs font-semibold leading-none transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1 ${
                            ativo
                              ? 'origin-center scale-[0.88] bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-inner shadow-violet-900/20'
                              : 'border border-transparent bg-white text-slate-300 hover:border-violet-200 hover:bg-violet-50/80 hover:text-violet-400'
                          }`}
                        >
                          <span
                            className={`transition-transform duration-150 ${ativo ? 'opacity-100' : 'opacity-45'}`}
                            aria-hidden
                          >
                            {ativo ? '✓' : '·'}
                          </span>
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}