import CardService from "./CardService"
import type {ServiceItem} from "../types/ServiceItem"

type Props = {
    title?: string
    services: ServiceItem[]
    emptyText?: string
    onPick?: (service: ServiceItem) => void
}

export default function ListService({
                                        title = "Serviços",
                                        services,
                                        onPick,
                                        emptyText = "Nenhum serviço cadastrado.",
                                    }: Props) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="border-b border-slate-100 p-2 text-lg font-semibold text-slate-900 text-center">
                {title}
            </h2>

            {services.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">{emptyText}</p>
            ) : (
                <ul className="mt-4 space-y-2">
                    {services.map((s) => (
                        <li key={s.id}>
                            <CardService service={s} onClick={onPick}/>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}