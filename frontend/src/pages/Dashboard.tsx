import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Match, Profile, Venue } from '../types'

const BORDER_GREY = '#2D2D2D'

const ACTIVITY_ICONS: Record<string, string> = {
  coffee: 'coffee',
  badminton: 'sports_tennis',
  padel: 'sports_tennis',
  'dev talks': 'forum',
  'tech talk': 'record_voice_over',
  'pair dev': 'code',
  default: 'groups',
}

function activityIcon(activity: string): string {
  const key = activity?.toLowerCase() || ''
  return ACTIVITY_ICONS[key] || ACTIVITY_ICONS[Object.keys(ACTIVITY_ICONS).find((k) => key.includes(k)) || 'default'] || 'groups'
}

type TabId = 'recommended' | 'recent' | 'nearby'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('recommended')
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set(['Rust', 'System Design']))

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data } = await api.get<Match[]>('/me/matches')
      return data
    },
  })

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<Profile>('/me/profile')
      return data
    },
  })

  const today = new Date().toISOString().slice(0, 10)
  const recommendedMatches = matches.filter((m) => m.matchDate === today || matches.indexOf(m) < 6)
  const displayMatches = activeTab === 'recommended' ? recommendedMatches : matches.slice(0, 6)

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev)
      if (next.has(skill)) next.delete(skill)
      else next.add(skill)
      return next
    })
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <section className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#000000]">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
          <h2 className="text-4xl font-black tracking-tighter mb-2 text-white">Top Matches for You</h2>
          <p className="text-slate-500">
            Personalized badminton match recommendations based on your profile.
          </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              to="/app/refer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              Referrals
            </Link>
            <Link
              to="/onboarding"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              Profile
            </Link>
          </div>
        </div>

        <div className="flex border-b gap-8 mb-8" style={{ borderColor: BORDER_GREY }}>
          {(
            [
              ['recommended', 'Recommended'] as const,
              ['recent', 'Recent Activity'] as const,
              ['nearby', 'Nearby'] as const,
            ] as [TabId, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`pb-4 border-b-2 font-black text-xs uppercase tracking-widest transition-colors ${
                activeTab === id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {matchesLoading ? (
          <div className="text-slate-500">Loading matches…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayMatches.length === 0 ? (
              <div className="col-span-full rounded-xl border p-8 text-center text-slate-500" style={{ borderColor: BORDER_GREY }}>
                No matches yet. Complete your profile and check back for daily pairings.
                <Link to="/app/profile" className="block mt-4 text-primary font-medium hover:underline">
                  Edit profile →
                </Link>
              </div>
            ) : (
              displayMatches.map((match) => (
                <MatchCard key={match.id} match={match} currentUserId={profile?.userId} />
              ))
            )}
          </div>
        )}
      </section>

      {/* Right sidebar: Filters + Upcoming Meetups */}
      <aside
        className="w-80 flex-shrink-0 border-l bg-[#000000] p-8 overflow-y-auto"
        style={{ borderColor: BORDER_GREY }}
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-lg text-white">Filters</h3>
          <button
            type="button"
            onClick={() => setSelectedSkills(new Set())}
            className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline"
          >
            Clear All
          </button>
        </div>
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5">Core Skills</h4>
            <div className="space-y-3">
              {['Rust', 'System Design', 'Go'].map((skill) => (
                <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedSkills.has(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="rounded border-[#2D2D2D] text-primary focus:ring-primary bg-[#1A1A1A] size-5"
                  />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-primary transition-colors">
                    {skill}
                  </span>
                  <span className="ml-auto text-xs text-slate-600">{skill === 'Rust' ? 42 : skill === 'System Design' ? 31 : 28}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5">Activity Type</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-2 rounded-lg bg-primary text-black text-[10px] font-black uppercase flex items-center gap-2 shadow-[0_0_10px_rgba(249,128,6,0.15)]">
                <span className="material-symbols-outlined text-[16px]">sports_tennis</span>
                Badminton
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5">Seniority Level</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="seniority"
                  className="rounded-full border-[#2D2D2D] text-primary focus:ring-primary bg-[#1A1A1A] size-5"
                />
                <span className="text-sm font-medium text-slate-300 group-hover:text-primary transition-colors">Mid-Level</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="seniority"
                  defaultChecked
                  className="rounded-full border-[#2D2D2D] text-primary focus:ring-primary bg-[#1A1A1A] size-5"
                />
                <span className="text-sm font-medium text-slate-300 group-hover:text-primary transition-colors">Senior / Staff</span>
              </label>
            </div>
          </div>
          <div className="pt-6 border-t" style={{ borderColor: BORDER_GREY }}>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-5">Upcoming Meetups</h4>
            <div className="space-y-4">
              {matches.filter((m) => m.matchDate >= today).slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-[#1A1A1A]/50"
                  style={{ borderColor: BORDER_GREY }}
                >
                  <div
                    className="size-10 rounded-lg bg-black border flex items-center justify-center flex-shrink-0 text-primary font-black text-[10px] text-center leading-tight"
                    style={{ borderColor: BORDER_GREY }}
                  >
                    {new Date(m.matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).replace(' ', '\n')}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {m.suggestedActivity} w/ {m.matchedWith?.displayName || 'Match'}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tight">{m.matchDate}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-600 ml-auto">chevron_right</span>
                </div>
              ))}
              {matches.filter((m) => m.matchDate >= today).length === 0 && (
                <p className="text-sm text-slate-500">No upcoming meetups.</p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function MatchCard({ match, currentUserId }: { match: Match; currentUserId?: string }) {
  const activity = match.suggestedActivity || 'Badminton'
  const icon = activityIcon(activity)
  const name = match.matchedWith?.displayName || 'Developer'
  const tags = match.matchedWith?.preferredActivities?.length
    ? match.matchedWith.preferredActivities
    : [activity]
  const matchPct = 85 + (match.id?.length ?? 0) % 14
  const partnerUserId = match.matchedWith?.userId ?? (currentUserId === match.user1Id ? match.user2Id : match.user1Id)
  const hasPhoto = match.matchedWith?.hasProfilePhoto && partnerUserId

  const queryClient = useQueryClient()
  const { data: venues = [] } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const { data } = await api.get<Venue[]>('/me/venues')
      return data
    },
  })
  const [selectedVenueId, setSelectedVenueId] = useState<string>(match.myVenueChoice ?? '')
  useEffect(() => {
    setSelectedVenueId(match.myVenueChoice ?? '')
  }, [match.myVenueChoice])
  const setVenue = useMutation({
    mutationFn: (venueId: string) => api.put(`/me/matches/${match.id}/venue`, { venueId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  })
  const venueName = (id: string) => venues.find((v) => v.id === id)?.name ?? id

  const { data: blob } = useQuery({
    queryKey: ['partner-photo', partnerUserId],
    queryFn: async () => {
      const { data } = await api.get<Blob>(`/me/partner/${partnerUserId}/photo`, { responseType: 'blob' })
      return data
    },
    enabled: !!hasPhoto && !!partnerUserId,
    staleTime: 5 * 60 * 1000,
  })

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) {
      setPhotoUrl(null)
      return
    }
    const url = URL.createObjectURL(blob)
    setPhotoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [blob])

  return (
    <div
      className="rounded-xl overflow-hidden hover:border-primary/40 transition-all group orange-glow border bg-[#1A1A1A]"
      style={{ borderColor: BORDER_GREY }}
    >
      <div className="relative h-48 bg-black overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(135deg, rgba(249,128,6,0.25) 0%, rgba(26,26,26,0.98) 70%)',
            }}
          />
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <div className="bg-black/90 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-wider">
            <span className={`material-symbols-outlined text-[14px]`}>{icon}</span>
            {activity}
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Developer</p>
          </div>
          <div className="bg-primary text-black px-2 py-0.5 rounded text-[10px] font-black italic shadow-[0_0_10px_rgba(249,128,6,0.3)]">
            {matchPct}% MATCH
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="bg-black/50 text-slate-300 border px-2 py-0.5 rounded text-[10px] font-bold"
              style={{ borderColor: BORDER_GREY }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">verified</span>
          <p className="text-xs text-slate-300 leading-snug">
            Match Reason: {match.matchedWith?.bio || `Shared interest in ${activity}.`}
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Select venue</p>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="flex-1 min-w-[140px] bg-[#0a0a0a] border rounded-lg px-3 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-primary focus:border-primary"
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
              className="px-3 py-2 rounded-lg bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 disabled:opacity-50"
            >
              Save
            </button>
          </div>
          {(match.myVenueChoice || match.partnerVenueChoice) && (
            <div className="text-[11px] text-slate-400 space-y-0.5">
              {match.myVenueChoice && <p>Your choice: {venueName(match.myVenueChoice)}</p>}
              {match.partnerVenueChoice && <p>Partner&apos;s choice: {venueName(match.partnerVenueChoice)}</p>}
            </div>
          )}
        </div>
        <Link
          to="/app/matches"
          className="block w-full mt-4 py-2.5 bg-primary text-black hover:brightness-110 font-black rounded-lg transition-all text-xs uppercase tracking-widest text-center shadow-[0_4px_10px_rgba(249,128,6,0.1)]"
        >
          View match
        </Link>
      </div>
    </div>
  )
}
