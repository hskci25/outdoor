import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../api/client'

const BORDER_GREY = '#2D2D2D'

export function Refer() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedInUrl, setLinkedInUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const submit = useMutation({
    mutationFn: (body: { email: string; phone?: string; linkedInUrl?: string }) =>
      api.post('/me/invite-requests', body),
    onSuccess: () => {
      setEmail('')
      setPhone('')
      setLinkedInUrl('')
      setError('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to save.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Email is required.')
      return
    }
    submit.mutate({
      email: trimmedEmail,
      phone: phone.trim() || undefined,
      linkedInUrl: linkedInUrl.trim() || undefined,
    })
  }

  return (
    <div className="max-w-[1024px] w-full mx-auto p-6 md:p-8 space-y-8 bg-[#000000]">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter text-white">
          Refer someone
        </h1>
        <p className="text-slate-400 text-sm">
          Add their details below. We&apos;ll verify manually and share a join link after approval.
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden shadow-xl bg-[#0a0a0a]" style={{ borderColor: BORDER_GREY }}>
        <div className="p-6 border-b bg-[#1A1A1A]" style={{ borderColor: BORDER_GREY }}>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-primary">person_add</span>
            Add referral details
          </h2>
        </div>
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="their@email.com"
                className="w-full bg-[#1A1A1A] border rounded-lg p-4 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-primary focus:border-primary"
                style={{ borderColor: BORDER_GREY }}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contact number"
                className="w-full bg-[#1A1A1A] border rounded-lg p-4 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-primary focus:border-primary"
                style={{ borderColor: BORDER_GREY }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">LinkedIn profile link</label>
              <input
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-[#1A1A1A] border rounded-lg p-4 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-primary focus:border-primary"
                style={{ borderColor: BORDER_GREY }}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && (
              <p className="text-sm text-emerald-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Details saved. We&apos;ll verify and get back to you.
              </p>
            )}
            <button
              type="submit"
              disabled={submit.isPending}
              className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary text-[#0a0a0a] font-bold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {submit.isPending ? 'Saving…' : 'Save details'}
            </button>
          </form>
          <div className="mt-6 flex items-start gap-3 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
            <p className="text-xs text-slate-400">
              Details are saved for manual verification. After approval from the backend, a join link (valid only for that email) can be shared with them.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
