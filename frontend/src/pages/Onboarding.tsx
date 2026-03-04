import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Profile } from '../types'

const ACTIVITY_MODULES = [
  { id: 'badminton', label: 'Badminton', icon: 'sports_tennis' },
] as const

const PROFICIENCY_OPTIONS = ['beginner', 'intermediate', 'expert'] as const

export function Onboarding() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = localStorage.getItem('token')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [editingSkills, setEditingSkills] = useState(false)
  const [skillsDraft, setSkillsDraft] = useState<{ skillId: string; skillName: string; proficiency?: string }[]>([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillProficiency, setNewSkillProficiency] = useState<string>('')
  const [photoUploading, setPhotoUploading] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<Profile>('/me/profile')
      return data
    },
    enabled: !!token,
  })

  const updateProfile = useMutation({
    mutationFn: (body: Partial<Profile>) => api.put('/me/profile', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setEditingBio(false)
      setEditingSkills(false)
    },
  })

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  useEffect(() => {
    if (profile?.bio !== undefined) setBioDraft(profile.bio ?? '')
  }, [profile?.bio])

  useEffect(() => {
    if (profile?.skills?.length !== undefined)
      setSkillsDraft(
        profile.skills.map((s) => ({
          skillId: s.skillId,
          skillName: s.skillName || s.skillId,
          proficiency: s.proficiency,
        }))
      )
  }, [profile?.skills])

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

  const handleSaveBio = () => {
    updateProfile.mutate({ bio: bioDraft })
  }

  const handleToggleActivity = (id: string) => {
    const current = profile?.preferredActivities ?? []
    const next = current.includes(id) ? current.filter((a) => a !== id) : [...current, id]
    updateProfile.mutate({ preferredActivities: next })
  }

  const addSkill = () => {
    const name = newSkillName.trim()
    if (!name) return
    setSkillsDraft((prev) => [
      ...prev,
      { skillId: name, skillName: name, proficiency: newSkillProficiency || undefined },
    ])
    setNewSkillName('')
    setNewSkillProficiency('')
  }

  const removeSkill = (index: number) => {
    setSkillsDraft((prev) => prev.filter((_, i) => i !== index))
  }

  const saveSkills = () => {
    updateProfile.mutate({
      skills: skillsDraft.map((s) => ({ skillId: s.skillId, skillName: s.skillName, proficiency: s.proficiency })),
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    api.post('/me/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      })
      .finally(() => {
        setPhotoUploading(false)
        e.target.value = ''
      })
  }

  if (!token) return null

  const displayName = profile ? 'Profile' : 'New member'
  const bio = profile?.bio ?? ''
  const activities = profile?.preferredActivities ?? []
  const skills = profile?.skills ?? []
  const matchCount = 0

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-slate-300 overflow-x-hidden">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#262626] px-6 md:px-10 py-4 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
          <h2 className="text-white text-lg font-bold tracking-tight uppercase font-mono">
            outdoor<span className="text-primary animate-pulse">_</span>
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/app" className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors font-mono">
              // Explorer
            </Link>
            <Link to="/onboarding" className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors font-mono">
              // Profile
            </Link>
          </nav>
          <div className="h-8 w-px bg-[#262626]" />
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-[10px] font-mono">AUTH_TOKEN: VALID</span>
            <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex justify-center py-10 px-4 md:px-6 gap-6 md:gap-8 max-w-[1400px] mx-auto w-full flex-col lg:flex-row">
        {/* Left sidebar: profile card + photo upload */}
        <aside className="w-full lg:max-w-[320px] flex flex-col gap-6">
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-1 bg-primary rounded-full blur opacity-25" />
              <div className="relative size-32 rounded-full border-4 border-primary overflow-hidden bg-[#161616] flex items-center justify-center">
                {photoUploading ? (
                  <span className="material-symbols-outlined text-4xl text-primary animate-pulse">hourglass_empty</span>
                ) : photoUrl ? (
                  <img src={photoUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-slate-500">person</span>
                )}
              </div>
              <div className="absolute bottom-1 right-1 size-6 bg-green-500 rounded-full border-4 border-[#1a1a1a]" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 px-3 py-1.5 rounded-lg bg-primary text-black text-xs font-bold hover:brightness-110 disabled:opacity-50"
              >
                {photoUrl ? 'Change photo' : 'Add photo'}
              </button>
            </div>
            <h1 className="text-white text-2xl font-black mb-1 font-mono">{displayName}</h1>
            <p className="text-primary text-sm font-bold font-mono uppercase tracking-tight mb-6">
              {profile?.currentCompany ? `@ ${profile.currentCompany}` : 'Complete your profile'}
            </p>
            <div className="w-full h-px bg-[#262626] mb-6" />
            <div className="flex flex-col gap-4 w-full">
              {profile?.githubLink && (
                <a href={profile.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 text-slate-400 hover:text-primary transition-colors font-mono text-sm">
                  <span className="material-symbols-outlined text-lg">link</span>
                  <span className="truncate">{profile.githubLink.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {!profile?.githubLink && (
                <span className="text-slate-500 text-sm font-mono">Add GitHub in profile</span>
              )}
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6">
            <h3 className="text-white text-xs font-bold font-mono uppercase tracking-widest mb-4 border-l-2 border-primary pl-3">
              Stats_Output
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0a0a] p-3 rounded border border-[#262626]">
                <p className="text-slate-500 text-[10px] font-mono uppercase">Reputation</p>
                <p className="text-white text-lg font-bold font-mono">—</p>
              </div>
              <div className="bg-[#0a0a0a] p-3 rounded border border-[#262626]">
                <p className="text-slate-500 text-[10px] font-mono uppercase">Matches</p>
                <p className="text-white text-lg font-bold font-mono">{matchCount}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Bio, Tech stack, Activities */}
        <div className="flex-1 flex flex-col gap-6 md:gap-8 max-w-[720px]">
          {/* Bio */}
          <section className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">description</span>
                <h2 className="text-white text-lg font-bold font-mono uppercase tracking-tight">System.Bio</h2>
              </div>
              {!editingBio ? (
                <button
                  type="button"
                  onClick={() => { setBioDraft(profile?.bio ?? ''); setEditingBio(true) }}
                  className="text-primary text-xs font-bold font-mono uppercase hover:underline"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setBioDraft(profile?.bio ?? ''); setEditingBio(false) }}
                    className="px-3 py-1.5 rounded border border-[#262626] text-slate-400 text-xs font-mono hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    disabled={updateProfile.isPending}
                    className="px-3 py-1.5 rounded bg-primary text-black text-xs font-bold hover:brightness-110 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
            {editingBio ? (
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                placeholder="Tell others what you're into..."
                rows={4}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg p-4 text-slate-300 font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />
            ) : (
              <div className="bg-[#0a0a0a] p-6 rounded-lg border border-[#262626] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <p className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  <span className="text-primary font-bold">root@outdoor:~$</span> cat description.txt{'\n\n'}
                  {bio || "Add a bio in your profile to tell others what you're into."}
                </p>
              </div>
            )}
          </section>

          {/* Skills */}
          <section className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">stack</span>
                <h2 className="text-white text-lg font-bold font-mono uppercase tracking-tight">Tech_Stack</h2>
              </div>
              {!editingSkills ? (
                <button
                  type="button"
                  onClick={() => {
                    setSkillsDraft(
                      (profile?.skills ?? []).map((s) => ({
                        skillId: s.skillId,
                        skillName: s.skillName || s.skillId,
                        proficiency: s.proficiency,
                      }))
                    )
                    setEditingSkills(true)
                  }}
                  className="text-primary text-xs font-bold font-mono uppercase hover:underline"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSkillsDraft(
                        (profile?.skills ?? []).map((s) => ({
                          skillId: s.skillId,
                          skillName: s.skillName || s.skillId,
                          proficiency: s.proficiency,
                        }))
                      )
                      setEditingSkills(false)
                    }}
                    className="px-3 py-1.5 rounded border border-[#262626] text-slate-400 text-xs font-mono hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveSkills}
                    disabled={updateProfile.isPending}
                    className="px-3 py-1.5 rounded bg-primary text-black text-xs font-bold hover:brightness-110 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
            {editingSkills ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skillsDraft.map((s, i) => (
                    <span
                      key={`${s.skillId}-${i}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded border border-primary bg-primary/5 text-primary text-xs font-mono"
                    >
                      {s.skillName}
                      {s.proficiency && <span className="text-slate-500">({s.proficiency})</span>}
                      <button type="button" onClick={() => removeSkill(i)} className="text-slate-400 hover:text-white">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 items-end">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    placeholder="e.g. Rust, Go"
                    className="flex-1 min-w-[120px] bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-slate-300 text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-primary"
                  />
                  <select
                    value={newSkillProficiency}
                    onChange={(e) => setNewSkillProficiency(e.target.value)}
                    className="bg-[#0a0a0a] border border-[#262626] rounded-lg px-3 py-2 text-slate-300 text-sm font-mono focus:outline-none focus:border-primary"
                  >
                    <option value="">Proficiency</option>
                    {PROFICIENCY_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 rounded bg-primary/20 text-primary text-xs font-bold font-mono hover:bg-primary/30"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {(skills.length ? skills.map((s) => (s.skillName || s.skillId) + (s.proficiency ? ` (${s.proficiency})` : '')) : ['Add skills in profile']).map((label) => (
                  <span
                    key={label}
                    className="px-4 py-2 rounded border border-primary text-primary text-xs font-bold font-mono bg-primary/5 hover:bg-primary/10 transition-all"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Networking modules (preferred activities) */}
          <section className="bg-[#1a1a1a] border border-[#262626] rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">hub</span>
              <h2 className="text-white text-lg font-bold font-mono uppercase tracking-tight">Networking_Modules</h2>
            </div>
            <p className="text-slate-400 text-sm font-mono mb-4">Toggle activities you’re interested in. Enable Badminton to get daily match suggestions.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {ACTIVITY_MODULES.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleToggleActivity(id)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 relative transition-all ${
                    activities.includes(id)
                      ? 'bg-[#0a0a0a] border-primary shadow-[inset_0_0_15px_rgba(249,128,6,0.1)]'
                      : 'bg-[#0a0a0a] border-[#262626] opacity-60 hover:opacity-80'
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl text-primary">{icon}</span>
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-widest">{label}</span>
                  {activities.includes(id) && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="text-[8px] text-primary font-mono font-bold">ACTIVE</span>
                      <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar: CTA */}
        <aside className="w-full lg:max-w-[300px] flex flex-col gap-6">
          <Link
            to="/app"
            className="w-full bg-primary text-black font-black py-4 px-6 rounded-lg font-mono uppercase tracking-widest shadow-[0_0_30px_rgba(249,128,6,0.3)] hover:brightness-110 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">dashboard</span>
            Go to Dashboard
          </Link>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-sm">info</span>
              <h4 className="text-primary text-[10px] font-bold font-mono uppercase">System_Status</h4>
            </div>
            <p className="text-slate-400 text-[11px] font-mono leading-relaxed">
              {profile ? 'Profile loaded. Use Edit on each section to update.' : 'Complete your profile to get matches.'}
              <br />
              Verified Developer Account
            </p>
          </div>
        </aside>
      </main>

      <footer className="border-t border-[#262626] py-6 flex flex-col items-center gap-4 bg-[#0a0a0a] mt-auto">
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest font-mono">outdoor</p>
          <div className="size-1 rounded-full bg-primary/50" />
          <Link to="/app" className="text-primary text-[10px] font-bold uppercase tracking-widest font-mono hover:underline">
            Dashboard
          </Link>
        </div>
        <p className="text-[9px] text-slate-700 font-mono">build_stable</p>
      </footer>

      {isLoading && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 flex items-center justify-center z-50">
          <p className="text-slate-400 font-mono">Loading...</p>
        </div>
      )}
    </div>
  )
}
