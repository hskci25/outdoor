import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'

export function InviteRequest() {
  const [searchParams] = useSearchParams()
  const [inviteCode, setInviteCode] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const invite = searchParams.get('invite')
    if (invite) setInviteCode(invite)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/invite-request', {
        inviteCode: inviteCode.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        linkedInUrl: linkedInUrl.trim() || undefined,
      })
      setSubmitted(true)
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string }
      setError(ax.response?.data?.message ?? ax.message ?? 'Request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen code-texture flex flex-col">
        <header className="border-b border-primary/20 px-4 md:px-10 py-6">
          <Link to="/" className="flex items-center gap-4 w-fit">
            <span className="material-symbols-outlined text-3xl text-primary">terminal</span>
            <h2 className="text-slate-100 text-xl font-bold tracking-tight">krew.life</h2>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-xl border border-primary/30 bg-[#1a130c]/80 p-8 shadow-2xl text-center">
            <span className="material-symbols-outlined text-5xl text-primary mb-4">check_circle</span>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Request received</h1>
            <p className="text-slate-400 text-sm">
              We&apos;ll review your details and get back to you with a join link at <strong className="text-slate-200">{email}</strong>.
            </p>
            <Link to="/" className="mt-6 inline-block text-primary hover:underline font-medium text-sm">Back to home</Link>
          </div>
        </main>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Request an invite</h1>
          <p className="text-slate-400 text-sm mb-6">Share your details. We&apos;ll review and send you a join link.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Invite code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full rounded-lg h-11 px-4 bg-[#0a0a0a] border border-primary/30 text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-primary"
                placeholder="From your referrer"
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
              <label className="block text-sm font-medium text-slate-300 mb-1">Contact number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg h-11 px-4 bg-[#0a0a0a] border border-primary/30 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">LinkedIn profile URL</label>
              <input
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                className="w-full rounded-lg h-11 px-4 bg-[#0a0a0a] border border-primary/30 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
                placeholder="https://linkedin.com/in/..."
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
              {loading ? 'Submitting…' : 'Submit request'}
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
