import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/Search'
import Carousel from '../components/Carousel.tsx'
import FeaturesSection from '../components/FeaturesSection.tsx'
import type { ProfessionalHit, ServiceHit } from '../types/search.ts'

export default function Home() {
  const navigate = useNavigate()

  const onBookingPick = useCallback(
    (hit: ProfessionalHit | ServiceHit) => {
      const params = new URLSearchParams()
      params.set('from', 'home')
      if (hit.type === 'professional') {
        params.set('professional_id', String(hit.id))
        params.set('professional_name', hit.name)
      } else {
        params.set('professional_id', String(hit.professional_id))
        params.set('professional_name', hit.professional_name)
        params.set('service_id', String(hit.id))
        params.set('service_title', hit.title)
      }
      navigate(`/appointment?${params.toString()}`)
    },
    [navigate],
  )

  return (
    <div className="max-w-[1400px]">
      <div className="relative overflow-hidden rounded-2xl">
        <div>
          <Carousel />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 z-10 max-w-xl rounded-2xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mb-3">
            <div className="text-sm font-semibold text-slate-900">Encontre e agende</div>
            <div className="text-xs text-slate-600">
              Pesquise um profissional ou um serviço e clique para marcar.
            </div>
          </div>
          <SearchBar
            variant="booking"
            className="pointer-events-auto"
            inputClassName="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 ps-5 text-sm text-gray-900 focus:border-violet-900 focus:ring-violet-900"
            onBookingPick={onBookingPick}
          />
        </div>
      </div>
      <FeaturesSection />
    </div>
  )
}