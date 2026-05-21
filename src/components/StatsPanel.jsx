export default function StatsPanel({ notices, session }) {
  const total = notices.length
  const myNotices = notices.filter(n => n.user_id === session?.user?.id).length
  const urgent = notices.filter(n => n.category === 'urgent').length
  const events = notices.filter(n => n.category === 'event').length

  const urgentPct = total > 0 ? Math.round((urgent / total) * 100) : 0
  const eventsPct = total > 0 ? Math.round((events / total) * 100) : 0
  const myPct = total > 0 ? Math.round((myNotices / total) * 100) : 0

  return (
    <div className="stats-panel">
      <div className="stat-card" style={{ '--pct': `${urgentPct * 3.6}deg` }}>
        <div>
          <div className="stat-label">Urgent Notices</div>
          <div className="stat-value">{urgent}</div>
        </div>
        <div className="stat-ring" style={{ background: `conic-gradient(rgba(255,255,255,0.9) ${urgentPct * 3.6}deg, rgba(255,255,255,0.2) 0)` }}>
          {urgentPct}%
        </div>
      </div>

      <div className="stat-card">
        <div>
          <div className="stat-label">Events</div>
          <div className="stat-value">{events}</div>
        </div>
        <div className="stat-ring" style={{ background: `conic-gradient(rgba(255,255,255,0.9) ${eventsPct * 3.6}deg, rgba(255,255,255,0.2) 0)` }}>
          {eventsPct}%
        </div>
      </div>

      <div className="stat-card" style={{ background: '#5a6b8a' }}>
        <div>
          <div className="stat-label">{session ? 'My Notices' : 'Total Posts'}</div>
          <div className="stat-value">{session ? myNotices : total}</div>
        </div>
        <div className="stat-ring" style={{ background: `conic-gradient(rgba(255,255,255,0.9) ${(session ? myPct : 75) * 3.6}deg, rgba(255,255,255,0.2) 0)` }}>
          {session ? myPct : 100}%
        </div>
      </div>

      {/* Recent posters */}
      <div className="card" style={{ marginTop: 0 }}>
        <div className="card-header">
          <span className="card-title">Recent Posters</span>
        </div>
        {notices.slice(0, 3).map((n, i) => {
          const name = n.profiles?.display_name || n.profiles?.email?.split('@')[0] || 'User'
          const initials = name[0]?.toUpperCase()
          return (
            <div key={n.id} className="person-row">
              <div className="person-avatar">{initials}</div>
              <div className="person-info">
                <div className="person-name">{name}</div>
                <div className="person-role">{n.category}</div>
              </div>
              <span className={`badge badge-${n.category}`}>{n.category}</span>
            </div>
          )
        })}
        {notices.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>No notices yet</div>}
      </div>
    </div>
  )
}
