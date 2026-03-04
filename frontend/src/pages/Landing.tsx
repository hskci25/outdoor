import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Landing() {
  const [inviteCode, setInviteCode] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = inviteCode.trim().toUpperCase().replace(/\s/g, '-')
    if (code) navigate(`/register?invite=${encodeURIComponent(code)}`)
    else navigate('/register')
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden code-texture">
      {/* Subtle code background */}
      <div className="absolute top-20 left-10 opacity-10 pointer-events-none font-mono text-xs hidden lg:block">
        <pre>{`const match = (devA, devB) => {
  return devA.skills.intersect(devB.skills);
};`}</pre>
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 pointer-events-none font-mono text-xs hidden lg:block text-right">
        <pre>{`while(playingBadminton) {
  smash();
  drinkCoffee();
}`}</pre>
      </div>

      <div className="flex min-h-screen flex-col px-4 md:px-20 lg:px-40">
        <header className="flex items-center justify-between border-b border-primary/20 px-4 md:px-10 py-6">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-primary">terminal</span>
            <h2 className="text-slate-100 text-xl font-bold tracking-tight">outdoor</h2>
          </div>
          <div className="flex items-center gap-6 md:gap-9">
            <Link to="/login" className="text-slate-400 hover:text-primary transition-colors text-sm font-medium hidden md:inline">
              Login
            </Link>
            <Link
              to="/login"
              className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-6 bg-primary text-[#0a0a0a] text-sm font-bold tracking-tight hover:brightness-110 transition-all"
            >
              Login
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-12 md:py-24">
          <div className="flex gap-3 p-3 flex-wrap justify-center mb-6">
            <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/10 border border-primary/30 px-6 shadow-[0_0_15px_rgba(249,128,6,0.2)]">
              <span className="material-symbols-outlined text-primary text-xl">lock_open</span>
              <p className="text-primary text-sm font-bold uppercase tracking-widest">Invite-Only Access</p>
            </div>
          </div>

          <h1 className="text-slate-100 tracking-tight text-5xl md:text-7xl font-bold leading-[1.1] px-4 text-center pb-6 terminal-text">
            Connect. <span className="text-primary">Build.</span> Play.
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-normal leading-relaxed max-w-2xl text-center px-4 mb-12">
            The exclusive, skill-based matching ecosystem for high-performing developers. Join for tech synergy, badminton sessions, and deep architectural discussions.
          </p>

          <div className="w-full max-w-xl px-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 text-center">
                <h3 className="text-slate-100 text-xl font-bold">Verify Membership</h3>
                <p className="text-slate-500 text-sm">Access is restricted to verified engineers.</p>
              </div>
              <div className="flex w-full items-stretch rounded-xl h-16 border-2 border-primary/30 focus-within:border-primary transition-all bg-[#1a130c]/50 overflow-hidden shadow-2xl group">
                <div className="flex items-center pl-5 text-primary/50 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">key</span>
                </div>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="flex flex-1 min-w-0 bg-transparent border-none text-slate-100 placeholder:text-slate-600 px-4 text-lg font-mono uppercase tracking-[0.2em] focus:outline-none focus:ring-0 h-full"
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={14}
                />
                <div className="flex items-center p-2">
                  <button
                    type="submit"
                    className="flex min-w-[140px] items-center justify-center rounded-lg h-12 px-6 bg-primary text-[#0a0a0a] text-base font-bold tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Join the Elite
                  </button>
                </div>
              </div>
            </form>

            <div className="flex justify-center gap-8 mt-8 grayscale opacity-40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span className="text-[10px] uppercase tracking-tighter font-bold">Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">code</span>
                <span className="text-[10px] uppercase tracking-tighter font-bold">128-Bit</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-auto py-10 px-4 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-primary/10">
          <p className="text-slate-500 text-xs font-medium">© 2025 OUTDOOR. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">Status</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
