import { useState } from 'react'
import { supabase } from '../supabaseClient'

const CATEGORIES = ['academic', 'event', 'urgent', 'general', 'announcement']

export default function NoticeForm({ session }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('notices').insert({
      title: title.trim(),
      body: body.trim(),
      category,
      user_id: session.user.id,
    })

    if (error) { setError(error.message) }
    else { setTitle(''); setBody(''); setCategory('general') }
    setLoading(false)
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">📝 Post a Notice</span>
      </div>
      <form className="post-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            type="text"
            placeholder="Notice title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="form-textarea"
            placeholder="Write your notice here..."
            value={body}
            onChange={e => setBody(e.target.value)}
            required
            maxLength={500}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select form-input" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        {error && <div className="error-msg">⚠ {error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : '📢 Post Notice'}
        </button>
      </form>
    </div>
  )
}
