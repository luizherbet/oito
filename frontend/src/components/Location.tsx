import { useAuth } from "../context/AuthContext.tsx"

export default function Location() {
  const { user } = useAuth()
  const city = user?.city?.trim()

  if (!city) return null

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pt-2 sm:px-4">
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
          <span className="text-[12px]">📍</span>
          <span className="truncate">{city}</span>
        </div>
      </div>
    </div>
  )
}