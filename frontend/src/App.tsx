// import {useState, useEffect} from 'react'
import './App.css'
// import {getHealth} from "./types/health.ts";
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import Home from './pages/Home.tsx'
import SingUp from './pages/SingUp.tsx'


function App() {
    // const [status, setStatus] = useState('carregando...')
    //
    // useEffect(() => {
    //     const run = async () => {
    //         const data = await getHealth()
    //         setStatus(data.status)
    //     }
    //     run()
    // }, [])

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/singup" element={<SingUp/>}/>
            </Routes>
        </Layout>
    )
}

export default App