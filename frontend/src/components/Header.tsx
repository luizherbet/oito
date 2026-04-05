import Logo from "./Logo.tsx";
import NavBar from "./NavBar.tsx";



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
            <Logo/>

            <NavBar/>
        </header>
    )
}