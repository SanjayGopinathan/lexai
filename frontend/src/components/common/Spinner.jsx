export function Spinner({ size = 18 }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid rgba(201,168,76,0.3)',
      borderTopColor: 'var(--gold)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

export function LoadingDots() {
  return (
    <span style={{ display:'inline-flex', gap:4 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:7, height:7, borderRadius:'50%', background:'var(--gold)',
          display:'inline-block',
          animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite`,
        }} />
      ))}
    </span>
  )
}

export function PageLoader({ text = 'Processing...' }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 24px' }}>
      <LoadingDots />
      <p style={{ marginTop:16, color:'var(--steel)', fontStyle:'italic', fontSize:15 }}>{text}</p>
    </div>
  )
}
