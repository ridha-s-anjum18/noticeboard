import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Sidebar from './components/Sidebar'
import NoticeBoard from './components/NoticeBoard'
import NoticeForm from './components/NoticeForm'
import StatsPanel from './components/StatsPanel'

export default function App() {
  const [session, setSession] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [activeTab, setActiveTab] = useState('board')
  const [toast, setToast] = useState(null)
  const [notices, setNotices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setShowAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch notices for stats
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('notices')
        .select('*, profiles(email, display_name)')
        .order('created_at', { ascending: false })
      if (data) setNotices(data)
    }
    load()

    const channel = supabase.channel('app-notices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setActiveTab('board')
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const userName = session?.user?.email?.split('@')[0] || 'Guest'
  const greeting = userName.charAt(0).toUpperCase() + userName.slice(1)

  return (
    <div className="app-shell">
      <Sidebar
        session={session}
        onSignOut={handleSignOut}
        onAuthOpen={() => setShowAuth(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-greeting">
            Hello, <span>{session ? greeting : 'Visitor'}</span>!
          </div>
          <div className="topbar-right">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="live-badge">
              <span className="live-dot" />
              Realtime
            </div>
            {session ? (
              <button className="icon-btn" onClick={handleSignOut} title="Sign out">🚪</button>
            ) : (
              <button className="icon-btn" onClick={() => setShowAuth(true)} title="Sign in">🔑</button>
            )}
          </div>
        </header>

        {/* Main grid */}
        <main className="page-body">
          {/* Notice Board - spans 2 cols */}
          <div className="col-span-2">
            <div className="card">
              <NoticeBoard session={session} onToast={showToast} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Post form — only if signed in */}
            {session && <NoticeForm session={session} />}

            {/* Stats */}
            <StatsPanel notices={notices} session={session} />

            {/* Sign in prompt for guests */}
            {!session && (
              <div className="card" style={{ textAlign: 'center', padding: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🔒</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Want to post?
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Sign in to post notices, announcements, and events.
                </div>
                <button className="btn-primary" onClick={() => setShowAuth(true)}>
                  Sign In to Post
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Auth modal */}
      {showAuth && <Auth onClose={() => setShowAuth(false)} />}

      {/* Toast */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  )
}
