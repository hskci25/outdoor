import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'

type InviteRequestItem = {
  id: string
  email: string
  phone: string
  linkedInUrl: string
  status: string
  referrerUserId: string
  referrerName: string
  createdAt: string
  joinToken: string
  usedAt: string
}

export function Admin() {
  const queryClient = useQueryClient()
  const [approveResult, setApproveResult] = useState<{ joinLink: string; email: string } | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'invite-requests'],
    queryFn: async () => {
      const { data: res } = await api.get<{ items: InviteRequestItem[] }>('/admin/invite-requests')
      return res.items
    },
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: res } = await api.post<{ joinToken: string; email: string; joinLink: string }>(`/admin/invite-requests/${id}/approve`)
      return res
    },
    onSuccess: (res) => {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      setApproveResult({ joinLink: `${base}/register?join=${res.joinToken}`, email: res.email })
      queryClient.invalidateQueries({ queryKey: ['admin', 'invite-requests'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/invite-requests/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invite-requests'] })
    },
  })

  const [copied, setCopied] = useState(false)
  const copyJoinLink = () => {
    if (approveResult?.joinLink) {
      navigator.clipboard.writeText(approveResult.joinLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const items = data ?? []
  const pending = items.filter((i) => i.status === 'PENDING')

  if (error && (error as { response?: { status?: number } })?.response?.status === 403) {
    return (
      <div className="max-w-[960px] w-full mx-auto p-6">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-red-200">
          You don&apos;t have permission to view this page. Admin only.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[960px] w-full mx-auto flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Invite requests</h1>
        <p className="text-slate-400 text-sm mt-1">Review and approve or reject. Share the join link only with the approved email.</p>
      </div>

      {approveResult && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 flex flex-col gap-3">
          <p className="text-slate-200 font-medium">Join link for {approveResult.email}</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={approveResult.joinLink}
              className="flex-1 rounded-lg px-3 py-2 bg-black/40 border border-primary/30 text-slate-200 text-sm font-mono"
            />
            <button
              type="button"
              onClick={copyJoinLink}
              className="px-4 py-2 rounded-lg bg-primary text-black font-semibold text-sm hover:brightness-110"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
          <p className="text-slate-400 text-xs">Link is valid only for this email. Expires in 7 days.</p>
          <button
            type="button"
            onClick={() => setApproveResult(null)}
            className="self-start text-primary/80 hover:text-primary text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="text-slate-400">Loading…</div>
      ) : pending.length === 0 && items.length === 0 ? (
        <div className="rounded-xl border border-[#2D2D2D] bg-[#1A1A1A]/50 p-8 text-center text-slate-400">
          No invite requests yet.
        </div>
      ) : (
        <div className="rounded-xl border border-[#2D2D2D] bg-[#1A1A1A]/50 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#2D2D2D] text-slate-400">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">LinkedIn</th>
                <th className="px-4 py-3 font-medium">Referrer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-[#2D2D2D]/80 hover:bg-white/5">
                  <td className="px-4 py-3 text-slate-200">{row.email}</td>
                  <td className="px-4 py-3 text-slate-400">{row.phone || '—'}</td>
                  <td className="px-4 py-3">
                    {row.linkedInUrl ? (
                      <a href={row.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[140px] inline-block">
                        Link
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{row.referrerName || row.referrerUserId}</td>
                  <td className="px-4 py-3">
                    <span className={row.status === 'PENDING' ? 'text-amber-400' : row.status === 'APPROVED' ? 'text-green-400' : 'text-slate-500'}>
                      {row.status}
                    </span>
                    {row.usedAt ? ' (used)' : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    {row.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => approveMutation.mutate(row.id)}
                          disabled={approveMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectMutation.mutate(row.id)}
                          disabled={rejectMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {row.status === 'APPROVED' && row.joinToken && !row.usedAt && (
                      <button
                        type="button"
                        onClick={() => {
                          const base = typeof window !== 'undefined' ? window.location.origin : ''
                          setApproveResult({ joinLink: `${base}/register?join=${row.joinToken}`, email: row.email })
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30"
                      >
                        Copy link
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
