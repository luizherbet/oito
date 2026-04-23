import Logo from "./Logo"
import NavBar from "./NavBar"

export default function Header() {
  return (
    <div className="w-full px-2 sm:px-4">
      <header className="mx-auto my-2 flex w-full max-w-6xl items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <Logo />
        <NavBar />
      </header>
    </div>
  )
}