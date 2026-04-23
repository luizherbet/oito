import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const guestItems = [
  { label: "Cadastre-se", to: "/register" },
  { label: "Entrar", to: "/login" },
]

export default function NavBar() {
  const { user, logout, loading } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) {
    return <span className="text-sm text-slate-500">...</span>
  }

  const closeMenu = () => setOpen(false)

  return (
    <nav className="relative" aria-label="Menu principal">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center rounded-md border border-slate-200 p-2 text-slate-700 md:hidden"
        aria-label="Abrir menu"
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {user ? (
        <>
          <ul className="hidden items-center gap-3 md:flex">
            <li>
              <Link
                to="/appointment"
                className="text-sm text-slate-700 transition hover:text-slate-900"
              >
                Agendamentos
              </Link>
            </li>

            {user.is_professional && (
              <>
                <li>
                  <Link
                    to="/professional/schedule"
                    className="text-sm text-slate-700 transition hover:text-slate-900"
                  >
                    Disponibilidade
                  </Link>
                </li>
                <li>
                  <Link
                    to="/professional/service"
                    className="text-sm text-slate-700 transition hover:text-slate-900"
                  >
                    Serviços
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link
                to="/profile"
                className="max-w-[110px] truncate rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700"
                title={user.name}
              >
                {user.name}
              </Link>
            </li>

            <li>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Sair
              </button>
            </li>
          </ul>

          {open && (
            <div className="absolute right-0 top-12 z-20 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-md md:hidden">
              <div className="mb-3 border-b border-slate-100 pb-3">
                <p className="truncate text-xs text-slate-500">Sessão iniciada</p>
                <p className="truncate text-sm font-medium text-slate-800">{user.name}</p>
              </div>

              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    to="/appointment"
                    onClick={closeMenu}
                    className="block rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Agendamentos
                  </Link>
                </li>

                {user.is_professional && (
                  <>
                    <li>
                      <Link
                        to="/professional/schedule"
                        onClick={closeMenu}
                        className="block rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Disponibilidade
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/professional/service"
                        onClick={closeMenu}
                        className="block rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Serviços
                      </Link>
                    </li>
                  </>
                )}

                <li>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="block rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Meu perfil
                  </Link>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu()
                      logout()
                    }}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          <ul className="hidden items-center gap-3 md:flex">
            {guestItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={
                    item.label === "Entrar"
                      ? "inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
                      : "text-sm text-slate-700 transition hover:text-slate-900"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {open && (
            <div className="absolute right-0 top-12 z-20 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-md md:hidden">
              <ul className="flex flex-col gap-2">
                {guestItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={closeMenu}
                      className={
                        item.label === "Entrar"
                          ? "block rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                          : "block rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </nav>
  )
}