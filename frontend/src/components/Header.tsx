import Logo from "./Logo.tsx";
import NavBar from "./NavBar.tsx";


export default function Header() {
    return (
        <div className="flex w-full justify-center">
            <header className="flex w-full max-w-6xl "
                    style={{
                        display: 'flex',
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
        </div>
    )
}