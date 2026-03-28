type NavItem = {
    label: string
    href: string
}

const navItems: NavItem[] = [
    {label: 'Cadastre-se', href: '/#singup'},
    {label: 'Entrar', href: '/#login'},
]

export default function Header() {
    return (
        <header
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                gap: 16,
                background: 'white',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 8,
                margin: 10
            }}
        >
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                <a href={"/"}>
                    <video
                        src="/logo.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        style={{height: 40, width: 'auto', borderRadius: 8, background: 'white'}}
                    />
                </a>

            </div>

            <nav aria-label="Menu principal">
                <ul style={{listStyle: 'none', display: 'flex', gap: 12, margin: 0, padding: 0, background: 'white'}}>
                    {navItems.map((item) => (
                        <li key={item.href}>
                            {item.label === 'Entrar' ?
                                <a
                                    href={item.href}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"

                                >
                                    {item.label}
                                </a>
                                :
                                <a
                                    href={item.href}
                                    className='text-slate-700  hover:text-slate-900 transition'


                                >
                                    {item.label}
                                </a>
                            }
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    )
}