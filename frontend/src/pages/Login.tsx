import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post<{ token: string }>('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      navigate('/onboarding', { replace: true })
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0a0a0a]">
      {/* Left: Hero (desktop only) */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0a0a0a] via-[#161109] to-primary/10" />
        <div className="absolute inset-0 z-0 code-texture opacity-30" aria-hidden />
        <div className="relative z-20 px-12 py-20 flex flex-col gap-8 max-w-xl">
          <Link to="/" className="flex items-center gap-3 w-fit">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-[#0a0a0a]">
              <span className="material-symbols-outlined font-bold text-2xl">terminal</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-white">outdoor</h2>
          </Link>
          <div className="space-y-4">
            <h1 className="text-5xl font-black leading-tight text-white">
              Connect. <span className="text-primary">Code.</span> Smash.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              The exclusive invite-only community where top-tier developers meet for coffee, badminton matches, and late-night architectural debates.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-primary text-sm">coffee</span>
              <span className="text-sm font-medium text-slate-200">Weekly Coffee</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-primary text-sm">sports_tennis</span>
              <span className="text-sm font-medium text-slate-200">Badminton League</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-primary text-sm">groups</span>
              <span className="text-sm font-medium text-slate-200">Dev Talks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-24 bg-[#0a0a0a]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h2>
            <p className="text-slate-400">Enter your credentials to access the network</p>
          </div>

          <div className="mt-10 space-y-6">
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-slate-700 px-4 py-3 text-sm font-bold text-slate-400 cursor-not-allowed"
            >
              <svg aria-hidden className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Login with GitHub (coming soon)</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-primary/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#0a0a0a] px-3 text-xs uppercase text-slate-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  required
                  className="block w-full rounded-lg border border-primary/20 bg-[#161109] px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <button type="button" className="text-xs font-semibold text-primary hover:text-primary/80">
                    Forgot password?
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full rounded-lg border border-primary/20 bg-[#161109] px-4 py-3 text-white placeholder-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="login-remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-primary/40 text-primary focus:ring-primary bg-[#161109]"
                />
                <label htmlFor="login-remember" className="ml-2 block text-sm text-slate-400">
                  Keep me logged in
                </label>
              </div>
              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg border border-primary px-4 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign in to Network'}
              </button>
            </form>
          </div>

          <div className="mt-10 border-t border-primary/10 pt-8 text-center">
            <p className="text-sm text-slate-400">
              New to the circle?{' '}
              <Link
                to="/register"
                className="font-bold text-primary hover:underline underline-offset-4 decoration-2"
              >
                Redeem Invite Code
              </Link>
            </p>
          </div>
        </div>

        {/* Mobile footer logo */}
        <div className="mt-12 flex lg:hidden items-center gap-2">
          <div className="size-6 bg-primary rounded flex items-center justify-center text-[#0a0a0a]">
            <span className="material-symbols-outlined text-xs font-bold">terminal</span>
          </div>
          <Link to="/" className="font-bold text-white">
            outdoor
          </Link>
        </div>
      </div>
    </div>
  )
}
