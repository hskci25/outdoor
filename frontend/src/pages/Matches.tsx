import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Match, Venue } from '../types'

const BORDER_GREY = '#2D2D2D'

function PartnerPhoto({ partnerUserId, hasPhoto, className }: { partnerUserId?: string; hasPhoto?: boolean; className?: string }) {
  const { data: blob } = useQuery({
    queryKey: ['partner-photo', partnerUserId],
    queryFn: async () => {
      const { data } = await api.get<Blob>(`/me/partner/${partnerUserId}/photo`, { responseType: 'blob' })
      return data
    },
    enabled: !!hasPhoto && !!partnerUserId,
    staleTime: 5 * 60 * 1000,
  })
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  if (!url)
    return (
      <div className={`rounded-full bg-primary/20 flex items-center justify-center text-primary ${className ?? 'size-16'}`}>
        <span className="material-symbols-outlined text-2xl">person</span>
      </div>
    )
  return <img src={url} alt="" className={`rounded-full object-cover ${className ?? 'size-16'}`} />
}

function TodayMatchCard({
  match,
  venues,
  queryClient,
}: {
  match: Match
  venues: Venue[]
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [selectedVenueId, setSelectedVenueId] = useState(match.myVenueChoice ?? '')
  useEffect(() => {
    setSelectedVenueId(match.myVenueChoice ?? '')
  }, [match.myVenueChoice])

  const setVenue = useMutation({
    mutationFn: (venueId: string) => api.put(`/me/matches/${match.id}/venue`, { venueId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  })
  const venueName = (id: string) => venues.find((v) => v.id === id)?.name ?? id

  return (
    <div className="mb-8 rounded-xl border border-primary/30 bg-[#1a130c]/50 p-6 flex flex-col gap-4">
      <div className="flex gap-4 items-start">
        <PartnerPhoto
          partnerUserId={match.matchedWith?.userId}
          hasPhoto={match.matchedWith?.hasProfilePhoto}
          className="size-20 flex-shrink-0"
        />
        <div className="flex-1">
          <h2 className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Today — Badminton</h2>
          <p className="text-slate-100">
            Matched with <strong>{match.matchedWith?.displayName ?? 'another developer'}</strong>.
          </p>
          {match.matchedWith?.bio && (
            <p className="mt-2 text-slate-400 text-sm">{match.matchedWith.bio}</p>
          )}
        </div>
      </div>
      <div className="pt-4 border-t border-primary/20 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Select venue</p>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="flex-1 min-w-[180px] bg-[#0a0a0a] border rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-primary"
            style={{ borderColor: BORDER_GREY }}
          >
            <option value="">Choose venue…</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => selectedVenueId && setVenue.mutate(selectedVenueId)}
            disabled={!selectedVenueId || setVenue.isPending}
            className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-bold hover:brightness-110 disabled:opacity-50"
          >
            Save venue
          </button>
        </div>
        {(match.myVenueChoice || match.partnerVenueChoice) && (
          <div className="text-sm text-slate-400 space-y-0.5">
            {match.myVenueChoice && <p>Your choice: <span className="text-slate-200">{venueName(match.myVenueChoice)}</span></p>}
            {match.partnerVenueChoice && <p>Partner&apos;s choice: <span className="text-slate-200">{venueName(match.partnerVenueChoice)}</span></p>}
          </div>
        )}
      </div>
    </div>
  )
}

export function Matches() {
  const queryClient = useQueryClient()
  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data } = await api.get<Match[]>('/me/matches')
      return data
    },
  })

  const { data: venues = [] } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data } = await api.get<Venue[]>('/me/venues')
      return data
    },
  })

  const today = new Date().toISOString().slice(0, 10)
  const todayMatch = matches?.find((m) => m.matchDate === today)
  const pastMatches = matches?.filter((m) => m.matchDate !== today) ?? []

  if (isLoading) return <p className="text-slate-400">Loading matches...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Match Discovery</h1>

      {todayMatch && (
        <TodayMatchCard match={todayMatch} venues={venues} queryClient={queryClient} />
      )}

      {!todayMatch && (
        <p className="text-slate-400 mb-6">No match for today. Add Badminton to your profile and check back tomorrow.</p>
      )}

      <h2 className="text-sm font-medium text-slate-300 mb-3 mt-8">Past matches</h2>
      <ul className="rounded-xl border border-primary/20 bg-[#1a130c]/30 divide-y divide-primary/10 overflow-hidden">
        {pastMatches.length === 0 && (
          <li className="px-4 py-4 text-slate-500 text-sm">None yet.</li>
        )}
        {pastMatches.map((m) => (
          <li key={m.id} className="px-4 py-3 flex justify-between items-center text-sm">
            <span className="text-slate-100 font-mono">{m.matchDate}</span>
            <span className="text-slate-400 capitalize">{m.suggestedActivity}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
