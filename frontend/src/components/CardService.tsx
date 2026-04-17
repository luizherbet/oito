import type { ServiceItem } from "../types/ServiceItem"

type Props = {
  service: ServiceItem
  onClick?: (service: ServiceItem) => void
}

export default function CardService({ service, onClick }: Props) {
  const disabled = !onClick

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick?.(service)}
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-violet-200 hover:shadow-md disabled:cursor-default disabled:opacity-80"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{service.title}</p>
          {service.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {service.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Sem descrição.</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-slate-900">
            R$ {Number(service.price).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500">{service.estimated_minutes} min</p>
        </div>
      </div>
    </button>
  )
}