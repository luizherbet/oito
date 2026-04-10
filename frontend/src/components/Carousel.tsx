import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

import banner1 from '../assets/banner1.png'
import banner2 from '../assets/banner2.png'
import banner3 from '../assets/banner3.png'
import banner4 from '../assets/banner4.png'

export default function Carousel() {
  const banners = [banner1, banner2, banner3, banner4]

  return (
    <Swiper
      modules={[Autoplay]}
      autoplay={{ delay: 3000 }}
      loop
    >
      {banners.map((banner, index) => (
        <SwiperSlide key={index}>
          <img className="rounded-lg" src={banner} alt={`banner-${index}`} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}