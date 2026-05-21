import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth({ onClose }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message) }
      else { setSuccess('Account created! You are now signed in.'); setTimeout(onClose, 1200) }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message) }
      else { onClose() }
    }
    setLoading(false)
  }

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>✕</button>
        <h2 className="auth-title">{mode === 'signin' ? 'Welcome back' : 'Join Campus'}</h2>
        <p className="auth-subtitle">
          {mode === 'signin' ? 'Sign in to post notices and manage your board.' : 'Create an account to start posting notices.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input className="form-input" type="text" placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}
          {success && <div style={{ background: '#f0faf0', color: '#2b8a3e', borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>✓ {success}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'signin' ? (
            <>Don't have an account? <button onClick={() => { setMode('signup'); setError(null) }}>Sign Up</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('signin'); setError(null) }}>Sign In</button></>
          )}
        </div>
      </div>
    </div>
  )
}
