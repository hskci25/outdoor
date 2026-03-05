import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Referral } from '../types'

const BORDER_GREY = '#2D2D2D'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function Refer() {
  const queryClient = useQueryClient()
  const [inviteMethod, setInviteMethod] = useState<'email' | 'github'>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const { data } = await api.get<Referral[]>('/me/referrals')
      return data
    },
  })

  const { data: inviteCodeData } = useQuery({
    queryKey: ['inviteCode'],
    queryFn: async () => {
      const { data } = await api.get<{ inviteCode: string }>('/me/invite-code')
      return data
    },
  })
  const myInviteCode = inviteCodeData?.inviteCode ?? ''

  const create = useMutation({
    mutationFn: (body: { referredName: string; referredEmail: string; referredPhone?: string; linkedinProfileLink?: string; resumeUrl?: string }) =>
      api.post('/me/referrals', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] })
      setEmail('')
      setError('')
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err?.response?.data?.message ?? 'Failed to send invite')
    },
  })

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Enter recipient email')
      return
    }
    create.mutate({ referredName: trimmed.split('@')[0] || 'Developer', referredEmail: trimmed })
  }

  const copyInviteLink = () => {
    const url = myInviteCode
      ? `${window.location.origin}/register?invite=${encodeURIComponent(myInviteCode)}`
      : `${window.location.origin}/register`
    navigator.clipboard.writeText(url).catch(() => {})
  }

  const copyRequestFormLink = () => {
    const url = myInviteCode
      ? `${window.location.origin}/?invite=${encodeURIComponent(myInviteCode)}`
      : window.location.origin
    navigator.clipboard.writeText(url).catch(() => {})
  }

  const copyInviteCode = () => {
    if (myInviteCode) navigator.clipboard.writeText(myInviteCode).catch(() => {})
  }

  const successfulCount = referrals.filter((r) => r.status?.toUpperCase() === 'SUCCESSFUL' || r.status === 'ACCEPTED').length
  const invitesRemaining = Math.max(0, 3 - referrals.length)

  return (
    <div className="max-w-[1024px] w-full mx-auto p-6 md:p-8 space-y-8 bg-[#000000]">
      {/* Hero */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter text-white">
          Invite Your Elite Peers
        </h1>
        <p className="text-primary text-sm uppercase tracking-widest opacity-80 font-mono">
          &gt; EXCLUSIVE ACCESS // PLATFORM FUNDED // BY INVITATION ONLY
        </p>
      </div>

      {/* Top cards: Balance + Active Bonus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-orange-700 p-[1px]">
          <div className="bg-[#0a0a0a] rounded-[11px] p-8 h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-20 -top-20 size-64 bg-primary/20 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 tracking-widest">
                CURRENT BALANCE
              </span>
              <div className="flex items-baseline gap-4">
                <p className="text-white text-6xl md:text-7xl font-black">{invitesRemaining}</p>
                <p className="text-slate-400 text-lg font-medium uppercase">Invites Remaining</p>
              </div>
              <p className="mt-4 text-slate-300 max-w-md">
                Your referral tokens are burning. Choose your peers wisely. Every successful entry strengthens our
                high-bandwidth network.
              </p>
              {myInviteCode && (
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <span className="text-slate-500 text-xs font-mono uppercase">Your invite code</span>
                  <code className="px-3 py-1.5 rounded bg-black/50 border border-primary/30 text-primary font-mono text-sm">
                    {myInviteCode}
                  </code>
                  <button
                    type="button"
                    onClick={copyInviteCode}
                    className="text-xs text-primary hover:underline font-mono"
                  >
                    Copy code
                  </button>
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 relative z-10">
              <button
                type="button"
                onClick={copyInviteLink}
                className="flex items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary text-[#0a0a0a] font-bold hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined">link</span>
                Copy Invite Link
              </button>
              <button
                type="button"
                onClick={copyRequestFormLink}
                className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all border border-primary/30"
              >
                <span className="material-symbols-outlined">person_add</span>
                Request form link
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all"
              >
                <span className="material-symbols-outlined">description</span>
                View Rules
              </button>
            </div>
          </div>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-3xl">verified</span>
            <span className="font-bold uppercase tracking-tight text-white">Active Bonus</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">Unlocked Premium Court Access</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {successfulCount >= 5
              ? 'You have achieved 5+ successful referrals. You now have priority booking for the Downtown Badminton Complex.'
              : `Complete ${5 - successfulCount} more successful referrals to unlock priority court booking.`}
          </p>
          <div className="w-full bg-primary/20 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(249,128,6,0.5)] transition-all duration-500"
              style={{ width: `${Math.min(100, (successfulCount / 5) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Send an Invitation */}
      <div className="rounded-xl border overflow-hidden shadow-xl bg-[#0a0a0a]" style={{ borderColor: BORDER_GREY }}>
        <div
          className="p-6 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-[#1A1A1A]"
          style={{ borderColor: BORDER_GREY }}
        >
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-primary">send</span>
            Send an Invitation
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInviteMethod('email')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                inviteMethod === 'email' ? 'bg-primary text-[#0a0a0a]' : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setInviteMethod('github')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                inviteMethod === 'github' ? 'bg-primary text-[#0a0a0a]' : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              GitHub
            </button>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <form onSubmit={handleSendInvite} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 px-1">Recipient Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="senior-dev@company.com"
                className="w-full bg-[#1A1A1A] border rounded-lg p-4 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-primary focus:border-primary"
                style={{ borderColor: BORDER_GREY }}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={create.isPending}
                className="w-full md:w-auto flex items-center justify-center gap-3 rounded-lg h-14 px-10 bg-primary text-[#0a0a0a] font-black text-lg hover:shadow-[0_0_20px_rgba(249,128,6,0.3)] transition-all disabled:opacity-50"
              >
                SEND INVITE
                <span className="material-symbols-outlined">rocket_launch</span>
              </button>
            </div>
          </form>
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex items-start gap-3 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
            <p className="text-xs text-slate-400 italic font-mono">
              Note: All invitees undergo a 48-hour automated verification process of their open-source contributions
              and professional standing before full network access is granted.
            </p>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-3 px-1 text-white">
          <span className="material-symbols-outlined text-primary">history</span>
          Referral History
        </h2>
        <div className="overflow-x-auto rounded-xl border shadow-sm bg-[#0a0a0a]" style={{ borderColor: BORDER_GREY }}>
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading referrals…</div>
          ) : !referrals.length ? (
            <div className="p-8 text-center text-slate-500">No referrals yet. Send an invite above.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 text-slate-400 text-xs font-bold uppercase tracking-widest" style={{ borderColor: BORDER_GREY }}>
                  <th className="px-6 py-4">Developer</th>
                  <th className="px-6 py-4 hidden sm:table-cell">Platform Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 hidden md:table-cell">Bonus Earned</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: BORDER_GREY }}>
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                          {initials(r.referredName)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{r.referredName}</p>
                          <p className="text-xs text-slate-500">{r.referredEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="material-symbols-outlined text-slate-400 text-sm">alternate_email</span>
                        Email Invitation
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          r.status?.toUpperCase() === 'SUCCESSFUL' || r.status === 'ACCEPTED'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            r.status?.toUpperCase() === 'SUCCESSFUL' || r.status === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-primary animate-pulse'
                          }`}
                        />
                        {r.status === 'ACCEPTED' ? 'Successful' : r.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <p className="text-sm font-medium text-primary">
                        {(r.status?.toUpperCase() === 'SUCCESSFUL' || r.status === 'ACCEPTED') ? 'Premium Court Access' : '—'}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button type="button" className="text-slate-400 hover:text-primary transition-colors p-1">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
