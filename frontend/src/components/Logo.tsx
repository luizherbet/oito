import { Link } from "react-router-dom"

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <video
        src="/logo.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="h-9 w-auto rounded-md bg-white sm:h-10"
      />
    </Link>
  )
}