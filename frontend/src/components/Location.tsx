import { useAuth } from '../context/AuthContext.tsx'

export default function Location() {
  const { user } = useAuth()

  const city = user?.city ?? ''

  return (
    <div className="mr-5 flex flex-row justify-end text-sm">
      📍 {city}
    </div>
  )
}