import { useState, useEffect } from 'react'
import './App.css'
import {getHealth} from "./types/health.ts";
import Layout from "./components/Layout.tsx";

function App() {
  const [status, setStatus] = useState('carregando...')

useEffect(() => {
  const run = async () => {
    const data = await getHealth()
    setStatus(data.status)
  }
  run()
}, [])

  return (
    <Layout>


      <div className="text-red-500">{status}</div>
    </Layout>
  )
}

export default App