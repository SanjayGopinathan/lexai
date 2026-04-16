const styles = {
  gold:    { background:'var(--gold-pale)',    color:'#8b6000', border:'1px solid rgba(201,168,76,0.3)' },
  safe:    { background:'var(--safe-bg)',      color:'var(--safe)',    border:'1px solid rgba(26,107,60,0.2)' },
  risky:   { background:'var(--risky-bg)',     color:'var(--risky)',   border:'1px solid rgba(139,96,0,0.2)' },
  illegal: { background:'var(--illegal-bg)',   color:'var(--illegal)', border:'1px solid rgba(139,26,26,0.2)' },
  blue:    { background:'#e8f0fe',             color:'#1a4fa0',        border:'1px solid rgba(26,79,160,0.2)' },
}

export function Badge({ variant = 'gold', children }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'3px 10px', borderRadius:20,
      fontSize:11, fontFamily:"'JetBrains Mono',monospace",
      fontWeight:500, letterSpacing:0.5,
      ...styles[variant],
    }}>
      {children}
    </span>
  )
}
