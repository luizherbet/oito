import Search from '../components/Search'
import Carousel from "../components/Carousel.tsx";
import FeaturesSection from "../components/FeaturesSection.tsx";

export default function Home() {
    return <div className="max-w-[1400px]">
        <div className="relative">
            <div>
                <Carousel/>
            </div>
            <div
                className="absolute left-2 bottom-2 z-10 flex flex-end justify-start px-4  bg-blue-100 min-h-[200px] w-fit p-4 rounded-lg">
                <Search/>
            </div>

        </div>
        <FeaturesSection/>
    </div>
}