import {useCallback, useEffect, useState} from "react"
import {getStoredToken, fetchMe} from "../../api/auth.ts"

const DIAS = [
    {dow: 0, label: "Dom"},
    {dow: 1, label: "Seg"},
    {dow: 2, label: "Ter"},
    {dow: 3, label: "Qua"},
    {dow: 4, label: "Qui"},
    {dow: 5, label: "Sex"},
    {dow: 6, label: "Sáb"},
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
    return `${dow}-${String(h).padStart(2, "0")}:00`
}

function intervaloParaCelulas(dow: number, startStr: string, endStr: string): string[] {
    const [sh, sm = 0, ss = 0] = startStr.split(":").map(Number)
    const [eh, em = 0, es = 0] = endStr.split(":").map(Number)
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

            const start = `${String(h0).padStart(2, "0")}:00:00`
            const end = `${String(endH).padStart(2, "0")}:00:00`

            if (start < end) {
                blocos.push({day_of_week: dow, start_time: start, end_time: end})
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
            const res = await fetch("/api/v1/schedules/me", {
                headers: {Authorization: `Bearer ${token}`},
            })

            const data = (await res.json().catch(() => [])) as
                | ScheduleRead[]
                | { detail?: unknown }

            if (!res.ok) {
                const detail =
                    !Array.isArray(data) && typeof data.detail === "string" ? data.detail : null
                throw new Error(detail ?? `Erro ao carregar (${res.status})`)
            }

            const rows = Array.isArray(data) ? data : []
            const next = new Set<string>()

            for (const row of rows) {
                if (!row.is_active) continue
                for (const id of intervaloParaCelulas(
                    row.day_of_week,
                    row.start_time,
                    row.end_time,
                )) {
                    next.add(id)
                }
            }

            setSelecionadas(next)
        } catch (e) {
            setMensagem(e instanceof Error ? e.message : "Erro ao carregar agenda.")
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

    function limparTudo() {
        setSelecionadas(new Set())
        setMensagem(null)
    }

    async function guardarAgenda() {
        const token = getStoredToken()
        if (!token) {
            setMensagem("Inicia sessão para guardar.")
            return
        }

        if (professionalId == null) {
            setMensagem("A carregar perfil… ou conta não é de profissional.")
            return
        }

        const blocos = selecionadasParaBlocos(selecionadas)

        setSalvando(true)
        setMensagem(null)

        try {
            const res = await fetch("/api/v1/schedules/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
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

            const data = (await res.json().catch(() => ({}))) as
                | ScheduleRead[]
                | { detail?: unknown }

            if (!res.ok) {
                const msg =
                    typeof data === "object" &&
                    data !== null &&
                    "detail" in data &&
                    typeof (data as { detail?: unknown }).detail === "string"
                        ? (data as { detail: string }).detail
                        : `Erro ao guardar (${res.status})`

                throw new Error(msg)
            }

            setMensagem(blocos.length === 0 ? "Agenda limpa." : "Horário guardado.")
            await carregarAgenda()
        } catch (e) {
            setMensagem(e instanceof Error ? e.message : "Erro ao guardar.")
        } finally {
            setSalvando(false)
        }
    }

    const totalSelecionadas = selecionadas.size

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-4 sm:px-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-slate-900">Disponibilidade</h1>
                <p className="text-sm text-slate-600">
                    Selecione os horários em que está disponível ao longo da semana.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                <section
                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-violet-50/40 p-4 shadow-sm sm:p-5">
                    <div className="mb-4 border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-semibold text-slate-900">Agenda semanal</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Toque numa célula para marcar ou desmarcar.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto max-w-[800px] mx-auto">
                            <table
                                className="w-full min-w-[370px] border-separate border-spacing-0 text-center text-sm">
                                <thead>
                                <tr className="bg-slate-50">
                                    <th
                                        scope="col"
                                        className="sticky left-0 z-20 border-b border-slate-200 bg-slate-50 py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                                    >
                                        Hora
                                    </th>

                                    {DIAS.map((d) => (
                                        <th
                                            key={d.dow}
                                            scope="col"
                                            className={`border-b border-slate-200 px-2 py-3 text-xs font-semibold uppercase tracking-wider ${
                                                d.dow === 0 || d.dow === 6
                                                    ? "bg-sky-50 text-sky-900"
                                                    : "text-slate-600"
                                            }`}
                                        >
                                            {d.label}
                                        </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody className="text-slate-700">
                                {HORAS.map((h) => (
                                    <tr key={h} className="odd:bg-white even:bg-slate-50/60">
                                        <th
                                            scope="row"
                                            className="sticky left-0 z-10 whitespace-nowrap border-b border-slate-100 bg-inherit py-1.5 pl-4 pr-3 text-left text-xs font-medium tabular-nums text-slate-500"
                                        >
                                            {String(h).padStart(2, "0")}:00
                                        </th>

                                        {DIAS.map((d) => {
                                            const id = celulaId(d.dow, h)
                                            const ativo = selecionadas.has(id)
                                            const fimDeSemana = d.dow === 0 || d.dow === 6

                                            return (
                                                <td
                                                    key={id}
                                                    className={`border-b border-slate-100 p-1 ${
                                                        fimDeSemana ? "bg-violet-50/40" : ""
                                                    }`}
                                                >
                                                    <button
                                                        type="button"
                                                        aria-pressed={ativo}
                                                        aria-label={
                                                            ativo
                                                                ? `Desmarcar ${d.label} às ${String(h).padStart(2, "0")}:00`
                                                                : `Marcar ${d.label} às ${String(h).padStart(2, "0")}:00`
                                                        }
                                                        onClick={() => alternar(id)}
                                                        className={`flex h-9 w-full min-w-[2rem] items-center justify-center rounded-md text-xs font-semibold transition ${
                                                            ativo
                                                                ? "bg-sky-900 text-white shadow-sm"
                                                                : "border border-transparent bg-white text-slate-300 hover:border-violet-200 hover:bg-violet-50 hover:text-sky-900"
                                                        }`}
                                                    >
                                                        <span aria-hidden>{ativo ? "✓" : "·"}</span>
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

                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-sky-900"/>
              Disponível
            </span>
                        <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded border border-slate-200 bg-white"/>
              Indisponível
            </span>
                    </div>
                </section>

                <aside
                    className="h-fit rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4 shadow-sm sm:p-5">
                    <div className="mb-4 border-b border-slate-200 pb-3">
                        <h2 className="text-lg font-semibold text-slate-900">Ações</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Salve as alterações para sincronizar com o servidor.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => void guardarAgenda()}
                            disabled={salvando || carregando || professionalId == null}
                            className="inline-flex items-center justify-center rounded-lg bg-sky-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-400 disabled:pointer-events-none disabled:opacity-45"
                        >
                            {salvando ? "A guardar…" : "Guardar"}
                        </button>

                        <button
                            type="button"
                            onClick={limparTudo}
                            disabled={salvando || carregando || totalSelecionadas === 0}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-45"
                        >
                            Limpar tudo
                        </button>
                    </div>

                    {mensagem && (
                        <p
                            role="status"
                            className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600"
                        >
                            {mensagem}
                        </p>
                    )}

                    {professionalId == null && (
                        <p className="mt-4 text-xs text-amber-700">
                            Apenas contas profissionais conseguem editar a disponibilidade.
                        </p>
                    )}
                </aside>
            </div>
        </div>
    )
}