import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { getUser, clearAuth } from '../../utils/auth'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/qa',        icon: '⚖️',  label: 'Legal Q&A Engine',    section: 'FEATURES' },
  { to: '/moot',      icon: '🏛️',  label: 'Moot Court',           section: 'FEATURES' },
  { to: '/document',  icon: '🔍',  label: 'Document Scanner',     section: 'FEATURES' },
  { to: '/cases',     icon: '📚',  label: 'Case Law Explorer',    section: 'FEATURES' },
  { to: '/dashboard', icon: '📊',  label: 'Student Dashboard',    section: 'MY PROFILE' },
]

const PAGE_TITLES = {
  '/qa':        'Legal Q&A Engine',
  '/moot':      'AI Moot Court Simulator',
  '/document':  'Document Risk Scanner',
  '/cases':     'Case Law Explorer',
  '/dashboard': 'Student Dashboard',
}

export default function Layout() {
  const user = getUser()
  const navigate = useNavigate()
  const path = window.location.pathname

  const handleLogout = () => {
    clearAuth()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const sections = [...new Set(NAV.map(n => n.section))]

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width:260, minHeight:'100vh', background:'var(--ink)',
        display:'flex', flexDirection:'column', position:'fixed',
        left:0, top:0, zIndex:100,
        borderRight:'1px solid rgba(201,168,76,0.2)',
      }}>
        {/* Brand */}
        <div style={{ padding:'28px 24px 20px', borderBottom:'1px solid rgba(201,168,76,0.15)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:36, height:36, background:'var(--gold)', borderRadius:8,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            }}>⚖️</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:'var(--gold)', letterSpacing:-0.5 }}>LexAI</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'rgba(201,168,76,0.5)', letterSpacing:2, textTransform:'uppercase' }}>Legal Intelligence</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding:'20px 12px', flex:1, display:'flex', flexDirection:'column', gap:4 }}>
          {sections.map(sec => (
            <div key={sec}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'rgba(201,168,76,0.4)', padding:'8px 12px 4px', marginTop:8 }}>
                {sec}
              </div>
              {NAV.filter(n => n.section === sec).map(item => (
                <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
                  borderRadius:8, textDecoration:'none', fontSize:14,
                  fontFamily:"'Crimson Pro',serif", fontWeight:400,
                  transition:'all 0.15s', border:'1px solid transparent',
                  background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
                  color: isActive ? 'var(--gold)' : 'rgba(245,240,232,0.55)',
                  borderColor: isActive ? 'rgba(201,168,76,0.2)' : 'transparent',
                })}>
                  <span style={{ fontSize:16, width:20, textAlign:'center' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding:16, borderTop:'1px solid rgba(201,168,76,0.1)' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:10, padding:10,
            borderRadius:8, background:'rgba(201,168,76,0.06)',
          }}>
            <div style={{
              width:32, height:32, borderRadius:'50%', background:'var(--gold)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, color:'var(--ink)', fontWeight:700,
              fontFamily:"'Playfair Display',serif",
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, color:'var(--paper)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize:10, color:'var(--steel)', fontFamily:"'JetBrains Mono',monospace" }}>{user?.role}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{
              background:'none', border:'none', cursor:'pointer',
              color:'rgba(201,168,76,0.4)', fontSize:16, padding:4,
            }}>→</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft:260, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <div style={{
          background:'var(--cream)', borderBottom:'1px solid var(--border)',
          padding:'0 32px', height:60, display:'flex', alignItems:'center',
          justifyContent:'space-between', position:'sticky', top:0, zIndex:50,
        }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>
            {PAGE_TITLES[path] || 'LexAI'}
          </span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'var(--steel)' }}>
            LexAI · Indian Legal Platform
          </span>
        </div>
        <div style={{ padding:32, flex:1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
