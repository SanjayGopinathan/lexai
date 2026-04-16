import { useState, useCallback } from 'react'
import { documentAPI } from '../services/api'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { PageLoader } from '../components/common/Spinner'
import toast from 'react-hot-toast'

const SAMPLE = `This Agreement is between the Employer and Employee.

1. EMPLOYMENT TERM: The Employee shall serve at the absolute will of the Employer and may be terminated without any prior notice, reason, or compensation at any time.

2. CONFIDENTIALITY: Employee agrees to never disclose any information even to family members, under any circumstances, for a period of 50 years after termination.

3. SALARY: Employee shall receive a salary as determined solely by the Employer. The Employer may revise, reduce, or withhold salary without prior notice.

4. INTELLECTUAL PROPERTY: All inventions or creative works produced by the Employee, whether during or outside working hours using personal equipment, shall be property of the Employer.

5. NON-COMPETE: Employee agrees not to work for any competitor within India for 10 years after leaving.

6. ANNUAL LEAVE: Employee is entitled to 12 days paid leave per year as per the Factories Act, 1948, subject to written approval.`

const RISK_COLORS = { LOW:'var(--safe)', MEDIUM:'var(--risky)', HIGH:'var(--crimson)' }
const RISK_BG     = { LOW:'var(--safe-bg)', MEDIUM:'var(--risky-bg)', HIGH:'var(--illegal-bg)' }

export default function DocumentPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [drag, setDrag] = useState(false)

  const handleScan = async (docText) => {
    const t = docText || text
    if (!t.trim()) { toast.error('Please provide document text'); return }
    setLoading(true); setResult(null)
    try {
      const res = await documentAPI.scanText(t, 'uploaded_document')
      setResult(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Scan failed')
    }
    setLoading(false)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setText(ev.target.result)
      reader.readAsText(file)
    }
  }, [])

  const loadSample = () => { setText(SAMPLE); toast.success('Sample contract loaded!') }

  const clauseColor = (cls) => ({ SAFE:'var(--safe-bg)', RISKY:'var(--risky-bg)', ILLEGAL:'var(--illegal-bg)' }[cls] || '#fff')
  const clauseBorder = (cls) => ({ SAFE:'var(--safe)', RISKY:'#c9a84c', ILLEGAL:'var(--crimson)' }[cls] || 'var(--border)')

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900 }}>Document Risk Scanner</h1>
        <p style={{ color:'var(--steel)', fontStyle:'italic', marginTop:6, fontSize:16 }}>Upload or paste a legal document to identify risky, unfair, or illegal clauses.</p>
      </div>

      {!result && (
        <Card style={{ marginBottom:20 }}>
          <div
            onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
            style={{ border:`2px dashed ${drag?'var(--gold)':'rgba(201,168,76,0.4)'}`, borderRadius:12, padding:40, textAlign:'center', cursor:'pointer', marginBottom:16, background: drag?'rgba(201,168,76,0.06)':'rgba(201,168,76,0.02)', transition:'all 0.2s' }}>
            <div style={{ fontSize:40, marginBottom:10 }}>📄</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, marginBottom:6 }}>Drop your document here</div>
            <div style={{ fontSize:14, color:'var(--steel)' }}>PDF, DOCX, or TXT — or paste text below</div>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, textTransform:'uppercase', color:'var(--steel)', marginBottom:6 }}>Or paste document text</label>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Paste your legal document text here..."
              style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:8, fontSize:15, fontFamily:"'Crimson Pro',serif", background:'var(--cream)', outline:'none', minHeight:160, resize:'vertical' }} />
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <Button onClick={() => handleScan()} loading={loading} disabled={!text.trim()}>
              🔍 Scan Document
            </Button>
            <Button variant="outline" onClick={loadSample}>
              📋 Load Sample Contract
            </Button>
          </div>
        </Card>
      )}

      {loading && <PageLoader text="Extracting clauses → Classifying risk → Generating legal references..." />}

      {result && (
        <div className="animate-in">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>Scan Complete</span>
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <Badge variant={result.overallRisk==='LOW'?'safe':result.overallRisk==='HIGH'?'illegal':'risky'}>
                  Overall Risk: {result.overallRisk}
                </Badge>
                <Badge variant="blue">{result.clauses?.length} clauses analysed</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => { setResult(null); setText('') }}>Scan Another</Button>
          </div>

          {/* Summary */}
          <div style={{ padding:'12px 16px', borderRadius:8, background:'#e8f0fe', border:'1px solid rgba(26,79,160,0.2)', color:'#1a4fa0', fontSize:14, marginBottom:16 }}>
            📋 {result.summary}
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            {[['SAFE','✅','var(--safe)','var(--safe-bg)'],['RISKY','⚠️','var(--risky)','var(--risky-bg)'],['ILLEGAL','🚫','var(--crimson)','var(--illegal-bg)']].map(([cls,icon,color,bg]) => (
              <div key={cls} style={{ background:bg, border:`1px solid ${color}30`, borderRadius:12, padding:20, textAlign:'center' }}>
                <div style={{ fontSize:28, fontFamily:"'Playfair Display',serif", fontWeight:900, color }}>{result.clauses?.filter(c=>c.classification===cls).length || 0}</div>
                <div style={{ fontSize:11, color:'var(--steel)', marginTop:4, fontFamily:"'JetBrains Mono',monospace" }}>{icon} {cls} CLAUSES</div>
              </div>
            ))}
          </div>

          {/* Clauses */}
          <Card style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:14 }}>Clause Analysis</div>
            {result.clauses?.map((c,i) => (
              <div key={i} className="animate-in" style={{ background:clauseColor(c.classification), borderLeft:`4px solid ${clauseBorder(c.classification)}`, borderRadius:8, padding:'14px 16px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <Badge variant={c.classification==='SAFE'?'safe':c.classification==='RISKY'?'risky':'illegal'}>
                    {c.classification==='SAFE'?'✓':c.classification==='RISKY'?'⚠️':'🚫'} {c.classification}
                  </Badge>
                  {c.legalReference && (
                    <span style={{ background:'#e8f0fe', color:'#1a4fa0', border:'1px solid rgba(26,79,160,0.2)', borderRadius:4, padding:'2px 8px', fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>
                      {c.legalReference}
                    </span>
                  )}
                </div>
                <p style={{ fontSize:14, lineHeight:1.6, fontStyle:'italic', margin:'6px 0', color:'var(--ink)' }}>"{c.text}"</p>
                <p style={{ fontSize:13, color:'var(--steel)', marginTop:6 }}>💬 {c.explanation}</p>
              </div>
            ))}
          </Card>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <Card gold>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, marginBottom:12 }}>⚡ Recommendations</div>
              {result.recommendations.map((r,i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
                  <span style={{ color:'var(--gold)', fontWeight:700 }}>{i+1}.</span>
                  <span style={{ fontSize:14 }}>{r}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
