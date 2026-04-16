import { useState, useEffect } from 'react'
import { studentAPI } from '../services/api'
import { getUser } from '../utils/auth'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { PageLoader } from '../components/common/Spinner'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'

const FALLBACK_TREND = [
  { session:'S1',score:55 },{ session:'S2',score:62 },{ session:'S3',score:58 },
  { session:'S4',score:71 },{ session:'S5',score:68 },{ session:'S6',score:78 },
]
const FALLBACK_RADAR = [
  { metric:'Argument',value:72 },{ metric:'Citations',value:58 },{ metric:'Rebuttal',value:65 },
  { metric:'Terminology',value:80 },{ metric:'Persuasion',value:69 },
]
const FALLBACK_HISTORY = [
  { id:1, case:'Environmental Pollution', domain:'Environmental', side:'Plaintiff', verdict:'Won', score:78, date:'2024-01-15' },
  { id:2, case:'Tenancy Rights Dispute',  domain:'Property',     side:'Defendant', verdict:'Lost',score:65, date:'2024-01-12' },
  { id:3, case:'Consumer Fraud Case',     domain:'Consumer',     side:'Plaintiff', verdict:'Won', score:82, date:'2024-01-08' },
]
const CITATIONS = [
  'Maneka Gandhi vs Union of India (1978) — Right to life and liberty',
  'Vishaka vs State of Rajasthan (1997) — Workplace harassment guidelines',
  'Kesavananda Bharati vs Kerala (1973) — Basic structure doctrine',
  'Olga Tellis vs Bombay Municipal (1985) — Right to livelihood',
  'MC Mehta vs Union of India (1987) — Environmental locus standi',
]

export default function DashboardPage() {
  const user = getUser()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.dashboard()
      .then(res => setData(res.data.data))
      .catch(() => {/* use fallback */})
      .finally(() => setLoading(false))
  }, [])

  const stats   = data?.stats   || { totalSessions:3, averageScore:75, wins:2, winRate:67, totalDocScans:5, totalSearches:8 }
  const trend   = data?.scoreTrend?.length ? data.scoreTrend : FALLBACK_TREND
  const radar   = data?.skillAverages
    ? Object.entries(data.skillAverages).map(([k,v]) => ({ metric: k.replace(/([A-Z])/g,' $1').trim(), value:v }))
    : FALLBACK_RADAR
  const history = data?.sessionHistory?.length ? data.sessionHistory : FALLBACK_HISTORY
  const weak    = data?.weakAreas || []

  const STAT_CARDS = [
    { value:stats.totalSessions, label:'Sessions Completed', trend:'+2 this week' },
    { value:`${stats.averageScore}%`, label:'Average Score', trend:'↑ improving' },
    { value:`${stats.wins}/${stats.totalSessions}`, label:'Cases Won', trend:`${stats.winRate}% win rate` },
    { value:CITATIONS.length, label:'Citations Saved', trend:'5 this month' },
  ]

  if (loading) return <PageLoader text="Loading your dashboard..." />

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900 }}>Student Dashboard</h1>
        <p style={{ color:'var(--steel)', fontStyle:'italic', marginTop:6, fontSize:16 }}>Track your moot court performance, progress, and legal citation bank.</p>
      </div>

      {/* User card */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
        <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)', fontSize:22, fontFamily:"'Playfair Display',serif", fontWeight:700 }}>
          {user?.name?.charAt(0) || 'S'}
        </div>
        <div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700 }}>{user?.name || 'Student'}</div>
          <div style={{ fontSize:12, color:'var(--steel)', fontFamily:"'JetBrains Mono',monospace" }}>{user?.email} · {user?.role}</div>
        </div>
        <Badge variant="gold" style={{ marginLeft:'auto' }}>🎓 Law Student</Badge>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
        {STAT_CARDS.map((s,i) => (
          <div key={i} style={{ background:'var(--cream)', border:'1px solid var(--border)', borderRadius:12, padding:20 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:900 }}>{s.value}</div>
            <div style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, textTransform:'uppercase', color:'var(--steel)', marginTop:4 }}>{s.label}</div>
            <div style={{ fontSize:13, color:'var(--sage-light)', fontWeight:600, marginTop:4 }}>↑ {s.trend}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <Card>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:16 }}>📈 Score Progression</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="session" tick={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace" }} />
              <YAxis domain={[0,100]} tick={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace" }} />
              <Tooltip contentStyle={{ fontFamily:"'Crimson Pro',serif", fontSize:13 }} />
              <Line type="monotone" dataKey="score" stroke="#c9a84c" strokeWidth={2.5} dot={{ fill:'#c9a84c', r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:16 }}>🎯 Skills Radar</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radar}>
              <PolarGrid stroke="rgba(0,0,0,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace" }} />
              <Radar dataKey="value" stroke="#c9a84c" fill="#c9a84c" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* History + Weak Areas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <Card>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:4 }}>📋 Session History</div>
          <div style={{ fontSize:12, color:'var(--steel)', marginBottom:14, fontFamily:"'JetBrains Mono',monospace" }}>Recent moot court sessions</div>
          {history.map((h,i) => (
            <div key={i} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600 }}>{h.case}</div>
                <div style={{ fontSize:11, color:'var(--steel)', fontFamily:"'JetBrains Mono',monospace" }}>{h.date} · {h.side}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700 }}>{h.score}%</span>
                <Badge variant={h.verdict==='Won'?'safe':'illegal'}>{h.verdict}</Badge>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:4 }}>⚠️ Areas to Improve</div>
          <div style={{ fontSize:12, color:'var(--steel)', marginBottom:14, fontFamily:"'JetBrains Mono',monospace" }}>Skills scoring below 70</div>
          {(weak.length ? weak : [
            { skill:'citationAccuracy', score:58, tip:'Practice citing exact section numbers precisely' },
            { skill:'rebuttalStrength', score:65, tip:'Address each opponent point directly before countering' },
            { skill:'persuasiveness',   score:69, tip:'Use storytelling alongside legal logic' },
          ]).map((a,i) => (
            <div key={i} style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:600, marginBottom:4 }}>
                <span>{a.skill.replace(/([A-Z])/g,' $1').trim()}</span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{a.score}/100</span>
              </div>
              <div style={{ height:6, background:'var(--paper)', borderRadius:3, border:'1px solid var(--border)', overflow:'hidden', marginBottom:4 }}>
                <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,var(--gold),var(--gold-light))', width:`${a.score}%` }} />
              </div>
              <div style={{ fontSize:12, color:'var(--steel)', fontStyle:'italic' }}>{a.tip}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Citation Bank */}
      <Card>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, marginBottom:4 }}>📚 Citation Bank</div>
        <div style={{ fontSize:12, color:'var(--steel)', marginBottom:14, fontFamily:"'JetBrains Mono',monospace" }}>Landmark cases saved for quick reference</div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {CITATIONS.map((c,i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', background:'var(--paper)', borderRadius:8, border:'1px solid var(--border)' }}>
              <span style={{ color:'var(--gold)', fontSize:14, marginTop:1 }}>⚖️</span>
              <span style={{ fontSize:14 }}>{c}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
