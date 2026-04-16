import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { saveAuth } from '../utils/auth'
import { Button } from '../components/common/Button'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: 'demo@lexai.in', password: 'demo1234' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      saveAuth(res.data.access_token, res.data.user)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate('/qa')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'var(--ink)',
    }}>
      <div style={{
        background:'var(--cream)', borderRadius:16, padding:40,
        width:400, boxShadow:'var(--shadow-lg)',
        border:'1px solid rgba(201,168,76,0.2)',
      }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>⚖️</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:900, color:'var(--ink)' }}>LexAI</h1>
          <p style={{ color:'var(--steel)', fontSize:14, fontStyle:'italic', marginTop:4 }}>
            AI-Powered Legal Intelligence Platform
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, textTransform:'uppercase', color:'var(--steel)', marginBottom:6 }}>
              Email Address
            </label>
            <input
              type="email" value={form.email} required
              onChange={e => setForm({...form, email: e.target.value})}
              style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:8, fontSize:15, fontFamily:"'Crimson Pro',serif", background:'var(--cream)', outline:'none' }}
            />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, textTransform:'uppercase', color:'var(--steel)', marginBottom:6 }}>
              Password
            </label>
            <input
              type="password" value={form.password} required
              onChange={e => setForm({...form, password: e.target.value})}
              style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:8, fontSize:15, fontFamily:"'Crimson Pro',serif", background:'var(--cream)', outline:'none' }}
            />
          </div>
          <Button type="submit" loading={loading} style={{ width:'100%', justifyContent:'center', padding:'12px 24px', fontSize:16 }}>
            Sign In to LexAI
          </Button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--steel)' }}>
          No account?{' '}
          <Link to="/register" style={{ color:'var(--gold)', textDecoration:'none', fontWeight:600 }}>
            Register here
          </Link>
        </p>
        <p style={{ textAlign:'center', marginTop:12, fontSize:12, color:'var(--steel)', fontStyle:'italic' }}>
          Demo: demo@lexai.in / demo1234
        </p>
      </div>
    </div>
  )
}
