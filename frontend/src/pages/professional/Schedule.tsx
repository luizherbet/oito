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
    if (blocos.length === 0) {
      setMensagem('Seleciona pelo menos um horário.')
      return
    }

    setSalvando(true)
    setMensagem(null)

    try {
      for (const b of blocos) {
        const res = await fetch('/api/v1/schedules/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            professional_id: professionalId,
            day_of_week: b.day_of_week,
            start_time: b.start_time,
            end_time: b.end_time,
            is_active: true,
          }),
        })
        const data = (await res.json().catch(() => ({}))) as { detail?: unknown }
        if (!res.ok) {
          const msg =
            typeof data.detail === 'string'
              ? data.detail
              : `Erro ao guardar (${res.status})`
          throw new Error(msg)
        }
      }
      setMensagem('Horário guardado.')
      await carregarAgenda()
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : 'Erro ao guardar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void guardarAgenda()}
          disabled={salvando || carregando || professionalId == null}
          className="rounded bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {salvando ? 'A guardar…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => void carregarAgenda()}
          disabled={carregando || professionalId == null}
          className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50"
        >
          {carregando ? 'A carregar…' : 'Recarregar'}
        </button>
        {mensagem && <p className="text-sm text-slate-600">{mensagem}</p>}
      </div>

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
    </div>
  )
}