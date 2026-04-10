import type {ReactNode} from 'react'
import Header from './Header.tsx'
import Footer from "./Footer.tsx";
import Location from "./Location.tsx";

export default function Layout({children}: { children: ReactNode }) {
    return (
        <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}} className="bg-indigo-50 flex justify-center">
            <Location/>
            <Header/>
            <main style={{flex: 1, padding: '16px'}}  className="flex justify-center">{children}</main>
            <Footer/>
        </div>
    )
}
