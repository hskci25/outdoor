import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Profile } from '../types'

const CARD_CHARCOAL = '#1A1A1A'
const BORDER_GREY = '#2D2D2D'

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<Profile>('/me/profile')
      return data
    },
    enabled: !!token,
  })

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    if (!profile?.hasProfilePhoto) {
      setPhotoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    let blobUrl: string | null = null
    api.get('/me/profile/photo', { responseType: 'blob' })
      .then(({ data }) => {
        blobUrl = URL.createObjectURL(data)
        setPhotoUrl(blobUrl)
      })
      .catch(() => setPhotoUrl(null))
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [profile?.hasProfilePhoto])

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (!token) return null

  const isDashboard = location.pathname === '/app' || location.pathname === '/app/'

  return (
    <div className="flex h-screen overflow-hidden bg-[#000000] text-slate-100">
      {/* Left sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col border-r border-[#2D2D2D] bg-[#000000]"
        style={{ borderColor: BORDER_GREY }}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-black">
            <span className="material-symbols-outlined font-bold">terminal</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-white">outdoor</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Invite-only access</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link
            to="/app"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isDashboard
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className={`material-symbols-outlined ${isDashboard ? 'nav-active-glow' : ''}`}>dashboard</span>
            <span className="text-sm font-semibold">Dashboard</span>
          </Link>
          <Link
            to="/app/matches"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">explore</span>
            <span className="text-sm font-medium">Matches</span>
          </Link>
          <Link
            to="/app/events"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              location.pathname === '/app/events'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="text-sm font-medium">Events</span>
          </Link>
          <Link
            to="/app/messages"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              location.pathname === '/app/messages'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="text-sm font-medium">Messages</span>
          </Link>
          <div className="pt-6 pb-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">System</p>
          </div>
          <Link
            to="/onboarding"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="text-sm font-medium">Profile</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Log out</span>
          </button>
        </nav>
        <div
          className="p-4 mt-auto border-t bg-black/30"
          style={{ borderColor: BORDER_GREY, backgroundColor: `${CARD_CHARCOAL}4D` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="size-10 rounded-full border bg-cover bg-center flex-shrink-0"
              style={{
                borderColor: BORDER_GREY,
                backgroundImage: photoUrl ? `url(${photoUrl})` : 'none',
                backgroundColor: photoUrl ? 'transparent' : CARD_CHARCOAL,
              }}
            />
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="text-sm font-bold truncate text-white">Profile</p>
              <p className="text-[11px] text-slate-500 truncate uppercase tracking-tighter">
                {profile?.currentCompany || 'Member'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden pl-6 md:pl-8">
        <header
          className="h-16 border-b flex items-center justify-between px-6 md:px-8 bg-black/80 backdrop-blur-md z-10"
          style={{ borderColor: BORDER_GREY }}
        >
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                search
              </span>
              <input
                type="text"
                placeholder="Search by tech, company or name..."
                className="w-full bg-[#1A1A1A] border rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                style={{ borderColor: BORDER_GREY }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="size-10 flex items-center justify-center rounded-lg hover:bg-[#1A1A1A] text-slate-400 hover:text-primary transition-colors relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full shadow-[0_0_5px_rgba(249,128,6,1)]" />
            </button>
            <div className="h-8 w-px bg-[#2D2D2D]" />
            <button
              type="button"
              onClick={() => navigate('/app/matches')}
              className="px-5 py-2 bg-primary text-black text-sm font-black rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(249,128,6,0.2)]"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">bolt</span>
              Quick Match
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
