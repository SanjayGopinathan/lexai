export function Card({ children, gold = false, style = {}, ...props }) {
  return (
    <div style={{
      background: gold ? 'linear-gradient(135deg,#faf7f2,#f5e9c5)' : 'var(--cream)',
      border: `1px solid ${gold ? 'rgba(201,168,76,0.3)' : 'var(--border)'}`,
      borderRadius: 12,
      padding: 24,
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
      {icon && (
        <div style={{
          width:36, height:36, borderRadius:8, background:'var(--ink)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
        }}>{icon}</div>
      )}
      <div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700 }}>{title}</div>
        {subtitle && <div style={{ fontSize:13, color:'var(--steel)' }}>{subtitle}</div>}
      </div>
    </div>
  )
}
