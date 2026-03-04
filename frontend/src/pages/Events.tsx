import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../api/client'
import type { Match, Venue } from '../types'

const BORDER_GREY = '#2D2D2D'

function formatDate(isoDate: string) {
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return isoDate
  }
}

export function Events() {
  const { data: matches = [], isLoading } = useQuery({
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
  const sessionMatch = matches.find((m) => m.matchDate >= today)

  const venueName = (id: string) => venues.find((v) => v.id === id)?.name ?? id
  const displayVenue =
    sessionMatch?.myVenueChoice && venueName(sessionMatch.myVenueChoice)
      ? venueName(sessionMatch.myVenueChoice)
      : sessionMatch?.partnerVenueChoice
        ? venueName(sessionMatch.partnerVenueChoice)
        : null

  if (isLoading) {
    return (
      <div className="max-w-[960px] w-full mx-auto flex flex-col gap-8">
        <div className="animate-pulse rounded-xl h-10 bg-white/5 w-48" />
        <div className="animate-pulse rounded-xl h-32 bg-white/5 w-full" />
      </div>
    )
  }

  if (!sessionMatch) {
    return (
      <div className="max-w-[960px] w-full mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-primary font-bold tracking-widest text-xs uppercase">EVENTS</span>
          <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight">Your Sessions</h1>
          <p className="text-slate-400 text-lg">
            Events are badminton sessions we fund when you’re matched with another developer. Your voucher and venue details will appear here once you have a match.
          </p>
        </div>

        <div
          className="rounded-xl border border-white/10 p-8 md:p-12 flex flex-col items-center justify-center text-center gap-6 min-h-[320px]"
          style={{ borderColor: BORDER_GREY, background: 'linear-gradient(135deg, #1a1a1a 0%, #1a130c 100%)' }}
        >
          <span className="material-symbols-outlined text-6xl text-primary/40">calendar_today</span>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-white">No session yet</h2>
            <p className="text-slate-400 max-w-md">
              Once you have a match, we’ll show your session details, venue, and digital voucher here. Complete your profile and check the Dashboard for daily match suggestions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-[#0a0a0a] font-semibold text-sm hover:brightness-110 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              Dashboard
            </Link>
            <Link
              to="/app/matches"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary/40 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">groups</span>
              Matches
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const voucherId = `OUT-BAD-${sessionMatch.id.slice(-6).toUpperCase()}`

  return (
    <div className="max-w-[960px] w-full mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="text-primary font-bold tracking-widest text-xs uppercase">MATCH CONFIRMED</span>
        <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight">Your Session is Ready</h1>
        <p className="text-slate-400 text-lg">
          Your badminton session has been fully funded by krew.life. See you there!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative" style={{ borderColor: BORDER_GREY }}>
            <div className="h-2 w-full bg-primary" />
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl qr-glow shrink-0">
                <div className="w-40 h-40 rounded-lg overflow-hidden flex items-center justify-center bg-white p-2">
                  <QRCodeSVG
                    value={`#${voucherId}`}
                    size={152}
                    level="M"
                    includeMargin={false}
                    className="w-full h-full"
                  />
                </div>
                <span className="text-slate-900 font-mono text-sm font-bold">#{voucherId}</span>
              </div>
              <div className="flex flex-col gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">verified</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Platform Funded Voucher</span>
                </div>
                <h3 className="text-white text-2xl font-bold">Badminton Session</h3>
                <p className="text-slate-400 text-base leading-relaxed">
                  Present this digital voucher at the reception. All court fees are covered under your invitation.
                </p>
                {displayVenue && (
                  <p className="text-slate-200 text-sm font-medium">
                    <span className="text-slate-500">Venue: </span>
                    {displayVenue}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mt-2">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-[#0a0a0a] px-6 py-3 rounded-lg font-bold transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined">download</span>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-primary/10 px-6 md:px-8 py-3 border-t border-white/5 flex flex-wrap justify-between items-center gap-2">
              <span className="text-primary text-xs font-bold uppercase tracking-tighter">Powered by krew.life</span>
              <span className="text-slate-500 text-xs">Valid until session date</span>
            </div>
          </div>

          <div className="bg-[#1A1A1A]/50 border border-white/5 rounded-xl p-6 flex flex-col gap-4" style={{ borderColor: BORDER_GREY }}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <h4 className="text-white font-bold">Venue Location</h4>
            </div>
            {displayVenue ? (
              <p className="text-slate-200 font-medium">{displayVenue}</p>
            ) : (
              <p className="text-slate-400 text-sm">Select your venue in Matches to see details here.</p>
            )}
            <div className="w-full h-48 rounded-lg bg-slate-800 relative overflow-hidden group">
              <div
                className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
              />
              {displayVenue && (
                <div className="absolute bottom-4 left-4 bg-[#1A1A1A]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 text-xs text-slate-100">
                  {displayVenue}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6" style={{ borderColor: BORDER_GREY }}>
            <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              Session Details
            </h3>
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Partner</p>
                <p className="text-white text-sm font-semibold">{sessionMatch.matchedWith?.displayName ?? 'Your match'}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Venue</p>
                <p className="text-white text-sm font-semibold">{displayVenue ?? 'Choose in Matches'}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Primary Activity</p>
                <p className="text-white text-sm font-semibold">Badminton</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Date</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-primary">calendar_today</span>
                  <p className="text-white text-sm font-semibold">{formatDate(sessionMatch.matchDate)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Booking Status</p>
                <div className="flex items-center gap-2 text-emerald-500">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <p className="text-sm font-bold uppercase tracking-wide">Confirmed & Funded</p>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="bg-primary/5 rounded-lg p-4 flex gap-3 border border-primary/20">
                <span className="material-symbols-outlined text-primary">payments</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-primary">krew.life guarantee:</strong> You won&apos;t be charged for any
                  services included in this session package.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#261a0d]/30 border border-primary/10 rounded-xl p-6">
            <h4 className="text-white text-sm font-bold mb-3">Need help?</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 hover:text-primary text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">help_outline</span>
                  Venue entry instructions
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  Rescheduling policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-primary text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">support_agent</span>
                  Contact concierge
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
