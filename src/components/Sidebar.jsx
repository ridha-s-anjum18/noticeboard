export default function Sidebar({ session, onSignOut, onAuthOpen, activeTab, setActiveTab }) {
  const navItems = [
    { id: 'board', icon: '📋', label: 'Notice Board' },
    { id: 'post', icon: '✏️', label: 'Post Notice' },
    { id: 'stats', icon: '📊', label: 'Stats' },
  ]

  const userInitial = session?.user?.email?.[0]?.toUpperCase() || '?'
  const userName = session?.user?.email?.split('@')[0] || 'Guest'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">Campus<span>Board</span></div>
        <div className="sidebar-logo-sub">Notice System</div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{userInitial}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{session ? userName : 'Guest'}</div>
          <div className="sidebar-user-role">{session ? 'Student' : 'Not signed in'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              if (item.id === 'post' && !session) { onAuthOpen(); return; }
              setActiveTab(item.id)
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.id === 'post' && !session && <span style={{ fontSize: 10, marginLeft: 'auto', opacity: 0.6 }}>🔒</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {session ? (
          <button className="nav-item" onClick={onSignOut}>
            <span className="nav-icon">🚪</span>
            Sign Out
          </button>
        ) : (
          <button className="nav-item" onClick={onAuthOpen} style={{ color: 'var(--accent)', fontWeight: 600 }}>
            <span className="nav-icon">🔑</span>
            Sign In
          </button>
        )}
      </div>
    </aside>
  )
}
