import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'

const guestItems = [
  { label: 'Cadastre-se', to: '/register', variant: 'link' as const },
  { label: 'Entrar', to: '/login', variant: 'button' as const },
]

export default function NavBar() {
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <nav aria-label="Menu principal">
        <span className="text-sm text-slate-500">…</span>
      </nav>
    )
  }

  if (user) {
    return (
      <nav aria-label="Menu principal">
        <ul
          style={{
            listStyle: 'none',
            display: 'flex',
            gap: 12,
            margin: 0,
            padding: 0,
            alignItems: 'center',
            background: 'white',
          }}
        >
          <li className="text-sm text-slate-700">{user.name}</li>
          <li>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Sair
            </button>
          </li>
        </ul>
      </nav>
    )
  }

  return (
    <nav aria-label="Menu principal">
      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          gap: 12,
          margin: 0,
          padding: 0,
          background: 'white',
        }}
      >
        {guestItems.map((item) => (
          <li key={item.to}>
            {item.variant === 'button' ? (
              <Link
                to={item.to}
                className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ) : (
              <Link to={item.to} className="text-slate-700 transition hover:text-slate-900">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}