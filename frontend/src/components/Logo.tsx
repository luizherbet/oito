export default function Logo() {
    return (<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
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

    </div>)
}