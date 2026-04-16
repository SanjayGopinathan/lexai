import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { saveAuth } from '../utils/auth'
import { Button } from '../components/common/Button'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.register(form)
      saveAuth(res.data.access_token, res.data.user)
      toast.success(`Account created! Welcome, ${res.data.user.name}!`)
      navigate('/qa')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    }
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', padding:'10px 14px', border:'1px solid var(--border)',
    borderRadius:8, fontSize:15, fontFamily:"'Crimson Pro',serif",
    background:'var(--cream)', outline:'none',
  }
  const labelStyle = {
    display:'block', fontSize:11, fontFamily:"'JetBrains Mono',monospace",
    letterSpacing:1, textTransform:'uppercase', color:'var(--steel)', marginBottom:6,
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--ink)' }}>
      <div style={{ background:'var(--cream)', borderRadius:16, padding:40, width:420, boxShadow:'var(--shadow-lg)', border:'1px solid rgba(201,168,76,0.2)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:6 }}>⚖️</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900 }}>Create Account</h1>
          <p style={{ color:'var(--steel)', fontSize:14, fontStyle:'italic', marginTop:4 }}>Join LexAI — India's AI Legal Platform</p>
        </div>
        <form onSubmit={handleRegister}>
          {[
            { label:'Full Name', key:'name', type:'text', placeholder:'Your full name' },
            { label:'Email Address', key:'email', type:'email', placeholder:'you@example.com' },
            { label:'Password', key:'password', type:'password', placeholder:'Min. 8 characters' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:14 }}>
              <label style={labelStyle}>{f.label}</label>
              <input
                type={f.type} placeholder={f.placeholder} required
                value={form[f.key]}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
                style={inputStyle}
              />
            </div>
          ))}
          <div style={{ marginBottom:24 }}>
            <label style={labelStyle}>I am a</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              style={{ ...inputStyle, cursor:'pointer' }}>
              <option value="student">Law Student</option>
              <option value="citizen">Citizen</option>
              <option value="lawyer">Practising Lawyer</option>
            </select>
          </div>
          <Button type="submit" loading={loading} style={{ width:'100%', justifyContent:'center', padding:'12px 24px', fontSize:16 }}>
            Create Account
          </Button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--steel)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--gold)', textDecoration:'none', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
