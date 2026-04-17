import type {ReactNode} from 'react'
import Header from './Header.tsx'
import Footer from "./Footer.tsx";
import Location from "./Location.tsx";

export default function Layout({children}: { children: ReactNode }) {
    return (
        <div className="bg-indigo-50 flex flex-col justify-center">
            <Location/>
            <Header/>
            <main style={{flex: 1, padding: '16px'}}  className="flex justify-center">{children}</main>
            <Footer/>
        </div>
    )
}
