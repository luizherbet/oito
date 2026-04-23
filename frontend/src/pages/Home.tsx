import SearchBar from "../components/Search"
import Carousel from "../components/Carousel"
import FeaturesSection from "../components/FeaturesSection"

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-4 sm:px-4">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-[380px] overflow-hidden rounded-2xl lg:col-span-2 sm:h-[420px] md:h-[460px]">
          <Carousel />
        </div>

<div className="h-[380px] rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-4 shadow-sm lg:col-span-1 sm:h-[420px] sm:p-5 md:h-[460px]">    <div className="flex h-full flex-col">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-900">
                Encontre e agende
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Pesquise um profissional ou um serviço e clique para marcar.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />
    </div>
  )
}