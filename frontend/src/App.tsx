// import {useState, useEffect} from 'react'
import './App.css'
// import {getHealth} from "./types/health.ts";
import {Routes, Route} from 'react-router-dom'
import Layout from './components/Layout.tsx'
import Home from './pages/Home.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import Appointment from './pages/Appointment.tsx'
import Services from "./pages/professional/Services.tsx";
import Schedule from "./pages/professional/Schedule.tsx";
import Profile from "./pages/Profile.tsx";


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
                <Route path="/appointment" element={<Appointment/>}/>
                <Route path="/professional/service" element={<Services/>}/>
                <Route path="/professional/schedule" element={<Schedule/>}/>
                <Route path="/profile/:professionalId" element={<Profile/>}/>
            </Routes>
        </Layout>
    )
}

export default App