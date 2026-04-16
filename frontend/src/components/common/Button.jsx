import { Spinner } from './Spinner'

const variants = {
  primary: { background:'var(--ink)', color:'var(--gold)', border:'1px solid rgba(201,168,76,0.3)' },
  gold:    { background:'var(--gold)', color:'var(--ink)', border:'none' },
  outline: { background:'transparent', color:'var(--ink)', border:'1px solid var(--border)' },
  danger:  { background:'var(--crimson)', color:'white', border:'none' },
}

export function Button({ variant = 'primary', loading = false, disabled = false, children, style = {}, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        display:'inline-flex', alignItems:'center', gap:8,
        padding:'10px 20px', borderRadius:8, fontSize:14,
        fontFamily:"'Crimson Pro',serif", fontWeight:600,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.55 : 1,
        transition:'all 0.15s',
        ...variants[variant],
        ...style,
      }}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  )
}
