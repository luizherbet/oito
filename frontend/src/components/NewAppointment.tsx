import SearchBar from "./Search.tsx";

export default function NewAppointment() {
    return  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
                    <h2 className="mb-2 text-lg font-semibold text-slate-900">Novo agendamento</h2>
                    <p className="mb-4 text-sm text-slate-600">
                        Pesquise e clique num <strong>serviço</strong> para agendar, ou num{' '}
                        <strong>profissional</strong> para escolher o serviço.
                    </p>

                    <SearchBar
                        variant="booking"
                        className="w-full"
                        inputClassName="block w-full rounded-xl border border-slate-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-violet-900 focus:ring-violet-900"
                        onBookingPick={(hit) => void handleBookingPick(hit)}
                    />

                    {catalogBusy && (
                        <p className="mt-2 text-sm text-slate-500">A carregar serviços…</p>
                    )}

                    {proCatalog && proCatalog.services.length > 0 && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-sm font-semibold text-slate-800">
                                Serviços de {proCatalog.name}
                            </p>
                            <ul className="max-h-48 space-y-1 overflow-y-auto">
                                {proCatalog.services.map((s) => (
                                    <li key={s.id}>
                                        <button
                                            type="button"
                                            className="w-full rounded-xl border border-white bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:border-violet-400"
                                            onClick={() => selectServiceFromCatalog(s)}
                                        >
                                            <span className="font-medium">{s.title}</span>
                                            <span className="text-slate-600"> — R$ {Number(s.price).toFixed(2)}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form
                        onSubmit={onBook}
                        className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4"
                    >
                        {formError && (
                            <p className="text-sm text-red-600" role="alert">
                                {formError}
                            </p>
                        )}

                        {pick ? (
                            <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
                                <strong>Serviço:</strong> {pick.service_title} — <strong>Profissional:</strong>{' '}
                                {pick.professional_name}
                            </p>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Nenhum serviço selecionado. Pesquise e clique num resultado.
                            </p>
                        )}

                        <label className="flex flex-col gap-1 text-sm">
                            Data
                            <input
                                type="date"
                                required
                                className="rounded border border-slate-300 px-3 py-2"
                                value={appointmentDate}
                                onChange={(e) => setAppointmentDate(e.target.value)}
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            Hora
                            <input
                                type="time"
                                required
                                className="rounded border border-slate-300 px-3 py-2"
                                value={appointmentTime}
                                onChange={(e) => setAppointmentTime(e.target.value)}
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                            Notas (opcional)
                            <textarea
                                rows={2}
                                maxLength={2000}
                                className="rounded border border-slate-300 px-3 py-2"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={formBusy || !pick}
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
                        >
                            {formBusy ? 'A enviar…' : 'Confirmar agendamento'}
                        </button>
                    </form>
                </section>
}