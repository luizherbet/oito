import CardAppointment from "./CardAppointment.tsx";
import {useEffect, useState} from "react";
import type {AppointmentRead} from "../types/appointment.ts";
import {
    fetchIncomingAppointments,
    fetchMyAppointments,
} from "../api/appointment.ts";
import {getStoredToken} from "../api/auth.ts";
import {useAuth} from "../context/AuthContext.tsx";

export function ListAppointments() {
    const [incoming, setIncoming] = useState<AppointmentRead[] | null>(null);
    const [mine, setMine] = useState<AppointmentRead[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {user, loading: authLoading} = useAuth();
    const isProfessional = !!user?.is_professional;

    async function confirmAppointment(appointmentId: number): Promise<AppointmentRead> {
        const res = await fetch(`/api/v1/appointments/${appointmentId}/confirm`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getStoredToken()}`,
            },
        });
        if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as { detail?: unknown };
            const msg = typeof data.detail === "string" ? data.detail : `Erro ${res.status}`;
            throw new Error(msg);
        }
        return res.json() as Promise<AppointmentRead>;
    }

    async function cancelAppointment(appointmentId: number): Promise<AppointmentRead> {
        const res = await fetch(`/api/v1/appointments/${appointmentId}/cancel`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getStoredToken()}`,
            },
        });
        if (!res.ok) {
            const data = (await res.json().catch(() => ({}))) as { detail?: unknown };
            const msg = typeof data.detail === "string" ? data.detail : `Erro ${res.status}`;
            throw new Error(msg);
        }
        return res.json() as Promise<AppointmentRead>;
    }

    useEffect(() => {
        if (authLoading) return;          // espera carregar user
        if (!user) return;
        let alive = true;

        async function run() {
            try {
                setLoading(true);
                setError(null);
                const [incomingRes, mineRes] = await Promise.allSettled([
                    fetchIncomingAppointments(),
                    fetchMyAppointments(),
                ]);
                if (incomingRes.status === "fulfilled") setIncoming(incomingRes.value);
                else setIncoming([]); // ou mantém null e não mostra erro “global”
                if (mineRes.status === "fulfilled") setMine(mineRes.value);
                else setMine([]);
            } catch (e) {
                if (!alive) return;
                setError(e instanceof Error ? e.message : "Erro ao buscar agendamentos.");
                setIncoming([]);
                setMine([]);
            } finally {
                setLoading(false);
            }
        }

        void run();
        return () => {
            alive = false;
        };
    }, [authLoading, user,]);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className=" border-b border-slate-100  p-2 text-lg font-semibold text-slate-900 text-center">Meus
                agendamentos</h2>
            {loading ? (
                <p className="mb-4 text-sm text-slate-600">Carregando...</p>
            ) : error ? (
                <p className="mb-4 text-sm text-red-600">{error}</p>
            ) : null}

            {(incoming?.length ?? 0) > 0 && (
                <>
                    <p className="mb-4 mt-5 text-sm text-slate-600">Quem agendou comigo?</p>
                    <ul className="space-y-2 text-sm">
                        {incoming!.map((a) => (
                            <CardAppointment
                                key={a.id}
                                service={a.service.title}
                                nome={a.client.name}
                                data={a.appointment_date}
                                time={a.appointment_time}
                                status={a.status}
                                isProfessional={true}
                                onConfirm={async () => {
                                    await confirmAppointment(a.id);
                                    const updated = await fetchIncomingAppointments();
                                    setIncoming(updated);
                                }}
                                onCancel={async () => {
                                    await cancelAppointment(a.id);
                                    const updated = await fetchIncomingAppointments();
                                    setIncoming(updated);
                                }}
                            />
                        ))}
                    </ul>
                </>
            )}

            {(mine?.length ?? 0) > 0 && (
                <><p className="mb-4 text-sm text-slate-600 mt-5">
                    Com quem eu agendei?
                </p>
                    <ul className="space-y-2 text-sm">
                        {mine && mine.length > 0
                            ? mine.map((a) => (
                                <CardAppointment
                                    key={a.id}
                                    service={a.service.title}
                                    nome={a.professional.name}
                                    data={a.appointment_date}
                                    time={a.appointment_time}
                                    isProfessional={false}

                                    status={a.status}
                                />
                            ))
                            : !loading && !error
                                ? "Nenhum agendamento!"
                                : null}

                    </ul>
                </>
            )}

        </div>
    )
}