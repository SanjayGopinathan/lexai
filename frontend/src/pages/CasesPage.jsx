import { useState } from 'react'
import { casesAPI } from '../services/api'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { PageLoader } from '../components/common/Spinner'
import toast from 'react-hot-toast'

const SAMPLES = [
  'Employee dismissed without following due process or hearing',
  'Landlord illegally locks tenant out of rented property',
  'Police arrest without showing warrant or reason',
  'Company refuses to refund defective product',
]

export default function CasesPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleSearch = async (q) => {
    const sq = q || query
    if (!sq.trim()) { toast.error('Enter a scenario to search'); return }
    setLoading(true); setResults(null)
    try {
      const res = await casesAPI.search(sq)
      setResults(res.data.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Search failed')
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900 }}>Case Law Explorer</h1>
        <p style={{ color:'var(--steel)', fontStyle:'italic', marginTop:6, fontSize:16 }}>Semantic search across Indian case law — find precedents using natural language.</p>
      </div>

      <Card style={{ marginBottom:20 }}>
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, textTransform:'uppercase', color:'var(--steel)', marginBottom:6 }}>Describe Your Legal Scenario</label>
          <textarea value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Describe a legal situation to find relevant case law..."
            style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:8, fontSize:15, fontFamily:"'Crimson Pro',serif", background:'var(--cream)', outline:'none', minHeight:90, resize:'none' }} />
        </div>
        <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <Button onClick={() => handleSearch()} loading={loading} disabled={!query.trim()}>
            🔍 Search Case Law
          </Button>
          <div>
            <div style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'var(--steel)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Quick scenarios:</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {SAMPLES.map((s,i) => (
                <button key={i} onClick={() => { setQuery(s); handleSearch(s) }}
                  style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'5px 12px', fontSize:12, cursor:'pointer', fontFamily:"'Crimson Pro',serif", color:'var(--ink)' }}>
                  {s.slice(0,45)}…
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {loading && <PageLoader text="Generating embeddings → Vector search → Ranking by relevance..." />}

      {results?.cases && (
        <div className="animate-in">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700 }}>{results.cases.length} Relevant Cases Found</span>
            <Badge variant="gold">Semantic Match</Badge>
          </div>
          {results.cases.map((c,i) => (
            <div key={i} className="animate-in" style={{ background:'var(--cream)', border:'1px solid var(--border)', borderRadius:10, padding:20, marginBottom:14, transition:'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:'var(--crimson)' }}>{c.name}</div>
                <Badge variant="blue">{c.year}</Badge>
              </div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'var(--steel)', marginBottom:10 }}>{c.court} · {c.citation}</div>
              <p style={{ fontSize:14, lineHeight:1.7, marginBottom:10 }}>{c.summary}</p>
              <div style={{ padding:'8px 12px', background:'var(--gold-pale)', borderRadius:6, fontSize:13, color:'#6b4a00', marginBottom:8 }}>
                <strong>Why relevant:</strong> {c.relevance}
              </div>
              {c.principle && (
                <div style={{ padding:'8px 12px', background:'rgba(44,62,80,0.05)', borderRadius:6, fontSize:13, color:'var(--slate)' }}>
                  <strong>Legal Principle:</strong> {c.principle}
                </div>
              )}
              {c.applicableSections?.length > 0 && (
                <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
                  {c.applicableSections.map((s,j) => (
                    <span key={j} style={{ background:'#e8f0fe', color:'#1a4fa0', border:'1px solid rgba(26,79,160,0.2)', borderRadius:4, padding:'2px 8px', fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
