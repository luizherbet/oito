// import {useState, useEffect} from 'react'
import './App.css'
// import {getHealth} from "./types/health.ts";
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import Home from './pages/Home.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'



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
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
            </Routes>
        </Layout>
    )
}

export default App