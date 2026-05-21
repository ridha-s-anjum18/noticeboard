import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import NoticeCard from './NoticeCard'

const CATEGORIES = ['all', 'academic', 'event', 'urgent', 'general', 'announcement']

export default function NoticeBoard({ session, onToast }) {
  const [notices, setNotices] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function fetchNotices() {
    const { data, error } = await supabase
      .from('notices')
      .select('*, profiles(email, display_name)')
      .order('created_at', { ascending: false })

    if (!error) setNotices(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchNotices()

    // Realtime subscription
    const channel = supabase
      .channel('notices-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notices' }, async (payload) => {
        // fetch the new notice with profile info
        const { data } = await supabase
          .from('notices')
          .select('*, profiles(email, display_name)')
          .eq('id', payload.new.id)
          .single()
        if (data) {
          setNotices(prev => [data, ...prev])
          onToast && onToast('🔔 New notice posted!')
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notices' }, (payload) => {
        setNotices(prev => prev.filter(n => n.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  function handleDelete(id) {
    setNotices(prev => prev.filter(n => n.id !== id))
  }

  const filtered = notices.filter(n => {
    const matchCat = filter === 'all' || n.category === filter
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div className="card-header" style={{ marginBottom: 12 }}>
        <span className="card-title" style={{ fontSize: 16 }}>📋 Notice Board</span>
        <div className="live-badge">
          <span className="live-dot" />
          Live
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          className="form-input"
          placeholder="🔍  Search notices..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* Category filter */}
      <div className="filter-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Notice list */}
      {loading ? (
        <div className="spinner-dark" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">No notices found</div>
        </div>
      ) : (
        <div className="notice-list">
          {filtered.map(notice => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              currentUserId={session?.user?.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
