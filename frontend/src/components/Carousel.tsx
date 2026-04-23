import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

import banner1 from "../assets/banner1.png"
import banner2 from "../assets/banner2.png"
import banner3 from "../assets/banner3.png"
import banner4 from "../assets/banner4.png"

const slides = [
  {
    image: banner1,
    title: "Menos conversa, mais marcações",
    description: "Encontre um serviço, escolha o horário e confirme em poucos passos.",
  },
  {
    image: banner2,
    title: "Sua agenda, do seu jeito",
    description: "Organize horários, serviços e atendimentos num só lugar.",
  },
  {
    image: banner3,
    title: "Encontre o profissional certo",
    description: "Pesquise por serviço ou profissional e marque com mais confiança.",
  },
  {
    image: banner4,
    title: "Simples para quem agenda",
    description: "Útil para quem atende. O Oito aproxima clientes e profissionais.",
  },
]

export default function Carousel() {
  return (
    <div className="h-[380px] w-full overflow-hidden rounded-2xl sm:h-[420px] md:h-[460px]">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full overflow-hidden rounded-2xl">
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
                style={{ backgroundImage: `url(${slide.image})` }}
              />

              <div className="absolute inset-0 bg-white/10" />

              <div className="relative flex h-full w-full items-center justify-center">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-900/30 to-transparent p-4 sm:p-6">
                <div className="max-w-md rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-sm">
                  <h2 className="text-lg font-semibold sm:text-xl">
                    {slide.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-100/90">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}