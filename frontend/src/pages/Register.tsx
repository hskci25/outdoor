import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const invite = params.get('invite')
    if (invite) setInviteCode(invite)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<{ token: string }>('/auth/register', {
        email,
        password,
        displayName: displayName || undefined,
        inviteCode: inviteCode.trim() || undefined,
      })
      localStorage.setItem('token', data.token)
      navigate('/onboarding', { replace: true })
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string }; status?: number }; message?: string }
      const msg = ax.response?.data?.message ?? (ax.response?.status === 400 ? 'Check your invite code and details.' : ax.message) ?? 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen code-texture flex flex-col">
      <header className="border-b border-primary/20 px-4 md:px-10 py-6">
        <Link to="/" className="flex items-center gap-4 w-fit">
          <span className="material-symbols-outlined text-3xl text-primary">terminal</span>
          <h2 className="text-slate-100 text-xl font-bold tracking-tight">krew.life</h2>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-primary/30 bg-[#1a130c]/80 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Sign up</h1>
          <p className="text-slate-400 text-sm mb-6">Invite only. Enter your invite code.</p>
          <p className="text-primary/90 text-xs mb-4 font-mono">First user? Use code: <strong>OUTDOOR_FIRST</strong></p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Invite code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full rounded-lg h-11 px-4 bg-[#0a0a0a] border border-primary/30 text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-primary"
                placeholder="XXXX-XXXX-XXXX"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg h-11 px-4 bg-[#0a0a0a] border border-primary/30 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-lg h-11 px-4 bg-[#0a0a0a] border border-primary/30 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
                placeholder="How others see you"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg h-11 px-4 bg-[#0a0a0a] border border-primary/30 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
                required
              />
            </div>
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3" role="alert">
                <span className="material-symbols-outlined text-red-400 text-lg flex-shrink-0 mt-0.5">error</span>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg h-12 bg-primary text-[#0a0a0a] font-bold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-400 text-center">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
