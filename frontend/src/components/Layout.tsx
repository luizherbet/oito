import type { ReactNode } from 'react'
import Header from './Header.tsx'
import Footer from "./Footer.tsx";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="bg-indigo-50">
      <Header />
      <main style={{ flex: 1, padding: '16px' }}>{children}</main>
      <Footer/>
    </div>
  )
}
