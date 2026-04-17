import {useNavigate} from 'react-router-dom'
import SearchBar from '../components/Search'
import Carousel from '../components/Carousel.tsx'
import FeaturesSection from "../components/FeaturesSection.tsx";


export default function Home() {

    return (
        <div className="max-w-[1300px] flex flex-row flex-wrap justify-center">
            <div className="overflow-hidden rounded-2xl max-w-[700px] ">
                <Carousel/>
            </div>
            <div
                className=" m-2 bottom-6 left-6 right-6 z-10 max-w-xl rounded-2xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/70">
                <div className="mb-3">
                    <div className="text-sm font-semibold text-slate-900">Encontre e agende</div>
                    <div className="text-xs text-slate-600">
                        Pesquise um profissional ou um serviço e clique para marcar.
                    </div>
                </div>
                <SearchBar
                    className="pointer-events-auto"
                    inputClassName="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 ps-5 text-sm text-gray-900 focus:border-violet-900 focus:ring-violet-900"
                />
            </div>
            <FeaturesSection/>
        </div>
    )
}