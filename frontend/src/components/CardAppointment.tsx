export default function CardAppointment({
                                            service,
                                            nome,
                                            data,
                                            time,
                                            status,
                                            onConfirm,
                                            onCancel,
                                            onReschedule,
                                            isProfessional
                                        }) {
    // function formatDateBr(iso: string): string {
    //     const [y, m, d] = iso.split('-')
    //     if (!y || !m || !d) return iso
    //     return `${d}/${m}/${y}`
    // }
    // function formatTimeShort(iso: string): string {
    //     return iso.length >= 5 ? iso.slice(0, 5) : iso
    // }
//     function timeToJson(t: string): string {
//     const trimmed = t.trim()
//     if (trimmed.length === 5) return `${trimmed}:00`
//     return trimmed
// }

    return (
        <div
            className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3 shadow-sm">

            <div className="flex flex-col">
                <strong className="text-slate-800">{nome}</strong>
                <span className="text-sm text-slate-700">{service}</span>
                <span className="text-xs text-slate-500">
          {data} - {time}
        </span>
                <span className="text-xs text-slate-500">
          {status}
        </span>
            </div>

            <div className="flex gap-2">
                {status === "Pendente" ? (
                    isProfessional && (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={onConfirm}
                                disabled={!onConfirm}
                                className="rounded-lg bg-green-500 px-1 py-1 text-xs text-white hover:bg-green-600 transition disabled:opacity-80"
                            >
                                Confirmar
                            </button>

                            <button
                                onClick={onReschedule}
                                disabled={!onReschedule}
                                className="rounded-lg bg-yellow-500 px-1 py-1 text-xs text-white hover:bg-yellow-600 transition disabled:opacity-80"
                            >
                                Reagendar
                            </button>

                            <button
                                onClick={onCancel}
                                disabled={!onCancel}
                                className="rounded-lg bg-red-500 px-1 py-1 text-xs text-white hover:bg-red-600 transition disabled:opacity-80"
                            >
                                Cancelar
                            </button>
                        </div>
                    )
                ) : (
                    <strong style={{ color: status === "Cancelado" ? "red" : "green" }} className="px-1 py-1 text-[10px]">{status}</strong>
                )}


            </div>
        </div>
    )
        ;
}
