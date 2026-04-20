import { useState } from 'react'
import { qaAPI } from '../services/api'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { PageLoader } from '../components/common/Spinner'
import toast from 'react-hot-toast'

const SAMPLES = [
  'My landlord refuses to return my security deposit after 3 months. What are my legal rights?',
  'Can my employer terminate me without notice or reason during probation period?',
  'I received a defective product. How do I file a consumer complaint in India?',
]

export default function QAPage() {
  const [question, setQuestion] = useState('')
  const [language, setLanguage] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true); setResult(null)
    try {
      const res = await qaAPI.ask(question, language)
      setResult(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'AI service error. Try again.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', padding:'10px 14px', border:'1px solid var(--border)',
    borderRadius:8, fontSize:15, fontFamily:"'Crimson Pro',serif",
    background:'var(--cream)', outline:'none', color:'var(--ink)',
  }
  const labelStyle = {
    display:'block', fontSize:11, fontFamily:"'JetBrains Mono',monospace",
    letterSpacing:1, textTransform:'uppercase', color:'var(--steel)', marginBottom:6,
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900 }}>Legal Q&A Engine</h1>
        <p style={{ color:'var(--steel)', fontStyle:'italic', marginTop:6, fontSize:16 }}>
          Ask any legal question in English, Hindi, or Tamil — get structured answers instantly.
        </p>
      </div>

      <Card style={{ marginBottom:20 }}>
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Your Legal Question</label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Describe your legal situation in plain language..."
            style={{ ...inputStyle, minHeight:120, resize:'vertical' }}
          />
        </div>

        <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:180 }}>
            <label style={labelStyle}>Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }}>
              <option value="auto">Auto-detect</option>
              <option value="Tamil">Tamil</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              
            </select>
          </div>
          <Button onClick={handleAsk} loading={loading} disabled={!question.trim()}>
            ⚖️ Get Legal Advice
          </Button>
        </div>

        <div style={{ marginTop:16 }}>
          <p style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'var(--steel)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Try a sample:</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {SAMPLES.map((s, i) => (
              <button key={i} onClick={() => setQuestion(s)}
                style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'5px 12px', fontSize:12, cursor:'pointer', fontFamily:"'Crimson Pro',serif", color:'var(--ink)' }}>
                {s.slice(0, 50)}…
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading && <PageLoader text="Detecting language → Classifying domain → Retrieving laws → Generating answer..." />}

      {result && (
        <div className="animate-in" style={{ border:'1px solid rgba(201,168,76,0.25)', borderRadius:12, overflow:'hidden' }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,var(--ink),#1a1a2e)', padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:24 }}>⚖️</span>
            <div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", color:'var(--gold)', fontSize:16 }}>Legal Analysis Complete</h3>
              <div style={{ display:'flex', gap:8, marginTop:6 }}>
                <Badge variant="gold">{result.domain}</Badge>
                <Badge variant="blue">{result.detectedLanguage}</Badge>
              </div>
            </div>
          </div>

          {/* Applicable Law */}
          <Section label="📋 Applicable Law" bg="#f9f5f0">
            <p style={{ fontWeight:700, color:'var(--crimson)', fontSize:16 }}>{result.applicableLaw}</p>
          </Section>

          {/* Explanation */}
          <Section label="💡 Explanation">
            <p style={{ fontSize:15, lineHeight:1.75, whiteSpace:'pre-wrap' }}>{result.explanation}</p>
          </Section>

          {/* Rights */}
          <Section label="🛡️ Your Rights">
            <ul style={{ paddingLeft:0, listStyle:'none' }}>
              {result.userRights?.map((r, i) => (
                <li key={i} style={{ fontSize:15, lineHeight:1.7, color:'var(--sage)', marginBottom:4 }}>✓ {r}</li>
              ))}
            </ul>
          </Section>

          {/* Actions */}
          <Section label="🚀 Suggested Actions">
            {result.suggestedActions?.map((a, i) => (
              <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
                <span style={{ background:'var(--ink)', color:'var(--gold)', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0, marginTop:2 }}>{i+1}</span>
                <span style={{ fontSize:15 }}>{a}</span>
              </div>
            ))}
          </Section>
{/* Where to Approach */}
{result.whereToApproach?.length > 0 && (
  <Section label="🏛️ Where to Approach" bg="#f5f5f5">
    {result.whereToApproach.map((place, i) => (
      <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
        <span style={{
          background:'#333',
          color:'#fff',
          borderRadius:'50%',
          width:22,
          height:22,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:11,
          fontWeight:700,
          flexShrink:0,
          marginTop:2
        }}>
          {i+1}
        </span>
        <span style={{ fontSize:15 }}>{place}</span>
      </div>
    ))}
  </Section>
)}
{/* Required Documents */}
{result.requiredDocuments?.length > 0 && (
  <Section label="📂 Required Documents" bg="#fff7e6">
    {result.requiredDocuments.map((doc, i) => (
      <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
        <span style={{
          background:'#b26a00',
          color:'#fff',
          borderRadius:'50%',
          width:22,
          height:22,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          fontSize:11,
          fontWeight:700,
          flexShrink:0,
          marginTop:2
        }}>
          {i+1}
        </span>
        <span style={{ fontSize:15 }}>{doc}</span>
      </div>
    ))}
  </Section>
)}
          {/* Citations */}
          {result.citations?.length > 0 && (
            <Section label="📚 Legal Citations" bg="#f0f4ff">
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {result.citations.map((c, i) => (
                  <span key={i} style={{ display:'inline-block', background:'#e8f0fe', color:'#1a4fa0', border:'1px solid rgba(26,79,160,0.2)', borderRadius:4, padding:'2px 8px', fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>{c}</span>
                ))}
              </div>
            </Section>
          )}

{/* Confidence Level */}
{result.confidence && (
  <Section label="📊 Confidence Level">
    <span style={{
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: 13,
      fontWeight: 600,
      background:
        result.confidence === "High"
          ? "#e6f7ee"
          : result.confidence === "Medium"
          ? "#fff4e5"
          : "#fdecea",
      color:
        result.confidence === "High"
          ? "#1e7e34"
          : result.confidence === "Medium"
          ? "#b26a00"
          : "#c62828"
    }}>
      {result.confidence}
    </span>
  </Section>
)}
          {/* Disclaimer */}
          <Section label="⚠️ Disclaimer" bg="#fffbf0">
            <p style={{ fontSize:13, color:'var(--risky)', fontStyle:'italic' }}>{result.disclaimer}</p>
          </Section>
        </div>
      )}
    </div>
  )
}

function Section({ label, children, bg }) {
  return (
    <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', background: bg || 'transparent' }}>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--gold)', marginBottom:8 }}>{label}</div>
      {children}
    </div>
  )
}
