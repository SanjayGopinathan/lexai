import { useState, useRef, useEffect } from 'react'
import { mootAPI } from '../services/api'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { Spinner, LoadingDots } from '../components/common/Spinner'
import toast from 'react-hot-toast'

const CASES = [
  { title:'Wrongful Termination Dispute',      domain:'Labour Law',   difficulty:'Medium' },
  { title:'Landlord-Tenant Security Deposit',  domain:'Property Law', difficulty:'Easy'   },
  { title:'Consumer Product Liability',        domain:'Consumer Law', difficulty:'Medium' },
  { title:'Defamation on Social Media',        domain:'Civil Law',    difficulty:'Hard'   },
  { title:'Environmental Pollution by Factory',domain:'Environmental',difficulty:'Hard'   },
  { title:'Cheque Dishonour Under NI Act',     domain:'Criminal Law', difficulty:'Easy'   },
]

const SCORE_KEYS = ['argumentQuality','citationAccuracy','rebuttalStrength','legalTerminology','persuasiveness']
const SCORE_LABELS = { argumentQuality:'Argument Quality', citationAccuracy:'Citation Accuracy', rebuttalStrength:'Rebuttal Strength', legalTerminology:'Legal Terminology', persuasiveness:'Persuasiveness' }

export default function MootPage() {
  const [phase, setPhase] = useState('setup')
  const [selCase, setSelCase] = useState(null)
  const [userRole, setUserRole] = useState('Plaintiff')
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnCount, setTurnCount] = useState(0)
  const [scores, setScores] = useState({ argumentQuality:0, citationAccuracy:0, rebuttalStrength:0, legalTerminology:0, persuasiveness:0 })
  const [verdict, setVerdict] = useState(null)
  const chatRef = useRef()

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [messages])

  const startSession = async () => {
    if (!selCase) { toast.error('Select a case first'); return }
    setLoading(true)
    try {
      const res = await mootAPI.start({ case_title: selCase.title, case_domain: selCase.domain, user_role: userRole })
      setSessionId(res.data.session_id)
      setMessages([{ role:'judge', speaker:"Hon'ble Judge", content: res.data.judge_opening }])
      setPhase('session')
    } catch (err) {
      toast.error('Failed to start session')
    }
    setLoading(false)
  }

  const sendArgument = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role:'user', speaker:'You', content: input }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setLoading(true)

    try {
      const history = newMsgs.map(m => ({ role: m.role === 'user' ? 'user' : 'user', content: `[${m.speaker}]: ${m.content}` }))
      const res = await mootAPI.turn({ session_id: sessionId, argument: userMsg.content, conversation_history: history })
      const tc = turnCount + 1
      setTurnCount(tc)

      setMessages(prev => [
        ...prev,
        { role:'judge',    speaker:"Hon'ble Judge",                                        content: res.data.judge_response },
        { role:'opponent', speaker:`Opp. Counsel (${userRole==='Plaintiff'?'Defendant':'Plaintiff'})`, content: res.data.opponent_response },
      ])

      // Live score simulation (backend would compute in real RAG system)
      const hasCitation = /section|act|vs|AIR|SCC|\d{4}/i.test(userMsg.content)
      setScores(prev => ({
        argumentQuality:  Math.min(100, prev.argumentQuality  + 5 + Math.floor(Math.random()*5)),
        citationAccuracy: Math.min(100, prev.citationAccuracy + (hasCitation ? 10 : 2)),
        rebuttalStrength: Math.min(100, prev.rebuttalStrength + 4 + Math.floor(Math.random()*6)),
        legalTerminology: Math.min(100, prev.legalTerminology + 4 + Math.floor(Math.random()*5)),
        persuasiveness:   Math.min(100, prev.persuasiveness   + 4 + Math.floor(Math.random()*6)),
      }))
    } catch (err) {
      toast.error('AI response failed. Try again.')
    }
    setLoading(false)
  }

  const endSession = async () => {
    if (turnCount < 2) { toast.error('Make at least 2 arguments before ending'); return }
    setLoading(true)
    try {
      const res = await mootAPI.end({ session_id: sessionId, conversation_history: messages, live_scores: scores })
      setVerdict(res.data.verdict)
      setPhase('verdict')
    } catch (err) {
      toast.error('Failed to generate verdict')
    }
    setLoading(false)
  }

  const resetAll = () => {
    setPhase('setup'); setMessages([]); setTurnCount(0)
    setVerdict(null); setSessionId(null); setInput('')
    setScores({ argumentQuality:0, citationAccuracy:0, rebuttalStrength:0, legalTerminology:0, persuasiveness:0 })
  }

  if (phase === 'setup') return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900 }}>AI Moot Court Simulator</h1>
        <p style={{ color:'var(--steel)', fontStyle:'italic', marginTop:6, fontSize:16 }}>Practice arguments against an AI Judge and opposing counsel in real-time.</p>
      </div>
      <div style={{ maxWidth:640, margin:'0 auto' }}>
        <Card style={{ marginBottom:20 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:14 }}>Select Case</div>
          {CASES.map((c, i) => (
            <div key={i} onClick={() => setSelCase(c)}
              style={{ padding:'14px 16px', border:`2px solid ${selCase?.title===c.title?'var(--gold)':'var(--border)'}`, borderRadius:10, cursor:'pointer', marginBottom:8, background: selCase?.title===c.title?'var(--gold-pale)':'transparent', transition:'all 0.15s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15 }}>{c.title}</div>
                  <div style={{ fontSize:13, color:'var(--steel)', marginTop:2 }}>{c.domain}</div>
                </div>
                <Badge variant={c.difficulty==='Easy'?'safe':c.difficulty==='Hard'?'illegal':'risky'}>{c.difficulty}</Badge>
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ marginBottom:20 }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, letterSpacing:1, textTransform:'uppercase', color:'var(--steel)', marginBottom:10 }}>Choose Your Side</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {['Plaintiff','Defendant'].map(r => (
              <div key={r} onClick={() => setUserRole(r)}
                style={{ padding:16, border:`2px solid ${userRole===r?'var(--gold)':'var(--border)'}`, borderRadius:10, cursor:'pointer', textAlign:'center', background: userRole===r?'var(--gold-pale)':'transparent', transition:'all 0.15s' }}>
                <div style={{ fontSize:28, marginBottom:6 }}>{r==='Plaintiff'?'⚔️':'🛡️'}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15 }}>{r}</div>
                <div style={{ fontSize:12, color:'var(--steel)', marginTop:2 }}>{r==='Plaintiff'?'Make the claim':'Defend the case'}</div>
              </div>
            ))}
          </div>
        </Card>

        <Button onClick={startSession} loading={loading} disabled={!selCase} style={{ width:'100%', justifyContent:'center', padding:'14px 24px', fontSize:16 }}>
          🏛️ Begin Moot Court Session
        </Button>
      </div>
    </div>
  )

  if (phase === 'verdict' && verdict) return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900 }}>Court Verdict & Scorecard</h1>
      </div>
      <div style={{ background:'linear-gradient(135deg,var(--ink),#1a1a2e)', borderRadius:12, padding:28, textAlign:'center', color:'var(--gold)', border:'1px solid rgba(201,168,76,0.2)', marginBottom:20 }}>
        <div style={{ fontSize:48, marginBottom:8 }}>⚖️</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, marginBottom:12 }}>{verdict.verdict || 'Verdict Delivered'}</div>
        <p style={{ fontSize:16, color:'rgba(245,240,232,0.85)', fontStyle:'italic', maxWidth:600, margin:'0 auto' }}>{verdict.reasoning}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <Card>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:16 }}>Performance Scores</div>
          {SCORE_KEYS.map(k => (
            <div key={k} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                <span>{SCORE_LABELS[k]}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{verdict.scores?.[k] || 0}/100</span>
              </div>
              <div style={{ height:6, background:'var(--paper)', borderRadius:3, border:'1px solid var(--border)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,var(--gold),var(--gold-light))', width:`${verdict.scores?.[k] || 0}%`, transition:'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:12 }}>Judge's Feedback</div>
          <p style={{ fontSize:15, fontStyle:'italic', lineHeight:1.7, marginBottom:16, color:'var(--slate)' }}>{verdict.feedback}</p>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, textTransform:'uppercase', color:'var(--sage)', marginBottom:6 }}>✅ Strong Points</div>
            {verdict.strongPoints?.map((p,i) => <div key={i} style={{ fontSize:14, color:'var(--sage)', marginBottom:4 }}>• {p}</div>)}
          </div>
          <div>
            <div style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, textTransform:'uppercase', color:'var(--crimson)', marginBottom:6 }}>⚠️ Weak Points</div>
            {verdict.weakPoints?.map((p,i) => <div key={i} style={{ fontSize:14, color:'var(--crimson)', marginBottom:4 }}>• {p}</div>)}
          </div>
        </Card>
      </div>

      <Button onClick={resetAll}>🔄 New Session</Button>
    </div>
  )

  // ── Session phase ──
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900 }}>{selCase?.title}</h1>
          <div style={{ display:'flex', gap:8, marginTop:6 }}>
            <Badge variant="gold">{selCase?.domain}</Badge>
            <Badge variant="blue">You: {userRole}</Badge>
            <Badge variant="safe">Turn {turnCount}</Badge>
          </div>
        </div>
        <Button variant="danger" onClick={endSession} disabled={loading || turnCount < 2} loading={loading && turnCount >= 2}>
          🔨 End & Get Verdict
        </Button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, height:'calc(100vh - 180px)' }}>
        {/* Chat panel */}
        <div style={{ display:'flex', flexDirection:'column', background:'var(--cream)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontFamily:"'Playfair Display',serif", color:'var(--gold)', fontSize:16 }}>🏛️ High Court — Moot Session</span>
            {loading && <Spinner />}
          </div>

          <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ maxWidth:'80%', alignSelf: m.role==='user'?'flex-end': m.role==='judge'?'center':'flex-start', animation:'slideIn 0.3s ease' }}>
                <div style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'var(--steel)', marginBottom:5, textAlign: m.role==='user'?'right': m.role==='judge'?'center':'left' }}>{m.speaker}</div>
                <div style={{
                  padding:'12px 16px', borderRadius:12, fontSize:15, lineHeight:1.6,
                  background: m.role==='judge'?'linear-gradient(135deg,var(--ink),#1a1a2e)': m.role==='opponent'?'#f0e8f8':'var(--ink)',
                  color: m.role==='judge'?'var(--gold)': m.role==='opponent'?'#4a0070':'var(--paper)',
                  border: m.role==='judge'?'1px solid rgba(201,168,76,0.2)': m.role==='opponent'?'1px solid rgba(74,0,112,0.15)':'1px solid rgba(201,168,76,0.2)',
                  textAlign: m.role==='judge'?'center':'left',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf:'center' }}>
                <div style={{ padding:'12px 20px', background:'linear-gradient(135deg,var(--ink),#1a1a2e)', borderRadius:12, border:'1px solid rgba(201,168,76,0.2)' }}>
                  <LoadingDots />
                </div>
              </div>
            )}
          </div>

          <div style={{ padding:12, borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
            <textarea
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="State your argument... cite sections, precedents, facts."
              style={{ flex:1, padding:'10px 14px', border:'1px solid var(--border)', borderRadius:8, fontSize:14, fontFamily:"'Crimson Pro',serif", background:'var(--cream)', outline:'none', resize:'none', minHeight:60 }}
              onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendArgument() } }}
            />
            <Button onClick={sendArgument} disabled={loading || !input.trim()} style={{ alignSelf:'flex-end' }}>
              Submit →
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, overflowY:'auto' }}>
          <Card>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, marginBottom:14 }}>📊 Live Scorecard</div>
            {SCORE_KEYS.map(k => (
              <div key={k} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                  <span>{SCORE_LABELS[k]}</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{scores[k]}</span>
                </div>
                <div style={{ height:6, background:'var(--paper)', borderRadius:3, border:'1px solid var(--border)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,var(--gold),var(--gold-light))', width:`${scores[k]}%`, transition:'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700, marginBottom:10 }}>💡 Tips</div>
            <div style={{ fontSize:13, color:'var(--steel)', lineHeight:1.8 }}>
              • Address Judge as <em>"My Lord"</em><br/>
              • Cite Section numbers precisely<br/>
              • Name landmark cases (e.g., Maneka Gandhi vs UOI)<br/>
              • Rebut opponent's points directly<br/>
              • Conclude with a clear prayer
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
