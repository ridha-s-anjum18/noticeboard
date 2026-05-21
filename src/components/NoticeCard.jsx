import { supabase } from '../supabaseClient'

const CATEGORY_CLASSES = {
  academic: 'badge-academic',
  event: 'badge-event',
  urgent: 'badge-urgent',
  general: 'badge-general',
  announcement: 'badge-announcement',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function NoticeCard({ notice, currentUserId, onDelete }) {
  const isOwner = currentUserId && currentUserId === notice.user_id
  const catClass = CATEGORY_CLASSES[notice.category] || 'badge-general'

  async function handleDelete() {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', notice.id)
    if (!error && onDelete) onDelete(notice.id)
  }

  return (
    <div className="notice-card">
      <div className="notice-card-top">
        <span className="notice-card-title">{notice.title}</span>
        <div className="notice-card-meta">
          <span className={`badge ${catClass}`}>{notice.category}</span>
          {isOwner && (
            <button className="delete-btn" onClick={handleDelete}>Delete</button>
          )}
        </div>
      </div>
      <p className="notice-card-body">{notice.body}</p>
      <div className="notice-card-footer">
        <span className="notice-card-author">
          {notice.profiles?.display_name || notice.profiles?.email?.split('@')[0] || 'Anonymous'}
        </span>
        <span className="notice-card-time">{timeAgo(notice.created_at)}</span>
      </div>
    </div>
  )
}
