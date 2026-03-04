import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import type { Profile as ProfileType } from '../types'

const ACTIVITIES = ['badminton', 'padel', 'coffee']

export function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [form, setForm] = useState({
    yearsExperience: '',
    currentCompany: '',
    targetCompanies: '',
    salaryRangeMin: '',
    salaryRangeMax: '',
    bio: '',
    preferredActivities: [] as string[],
    resumeLink: '',
    githubLink: '',
  })

  const fetchPhoto = useCallback(() => {
    api.get('/me/profile/photo', { responseType: 'blob' })
      .then(({ data }) => setPhotoUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(data) }))
      .catch(() => setPhotoUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null }))
  }, [])

  useEffect(() => {
    api.get<ProfileType>('/me/profile')
      .then(({ data }) => {
        setForm({
          yearsExperience: data.yearsExperience?.toString() ?? '',
          currentCompany: data.currentCompany ?? '',
          targetCompanies: (data.targetCompanies ?? []).join(', '),
          salaryRangeMin: data.salaryRangeMin?.toString() ?? '',
          salaryRangeMax: data.salaryRangeMax?.toString() ?? '',
          bio: data.bio ?? '',
          preferredActivities: data.preferredActivities ?? [],
          resumeLink: data.resumeLink ?? '',
          githubLink: data.githubLink ?? '',
        })
        if (data.hasProfilePhoto) fetchPhoto()
        else setPhotoUrl(null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [fetchPhoto])

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])

  const toggleActivity = (a: string) => {
    setForm((prev) => ({
      ...prev,
      preferredActivities: prev.preferredActivities.includes(a)
        ? prev.preferredActivities.filter((x) => x !== a)
        : [...prev.preferredActivities, a],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/me/profile', {
        yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience, 10) : null,
        currentCompany: form.currentCompany || null,
        targetCompanies: form.targetCompanies.split(',').map((s) => s.trim()).filter(Boolean),
        salaryRangeMin: form.salaryRangeMin ? parseFloat(form.salaryRangeMin) : null,
        salaryRangeMax: form.salaryRangeMax ? parseFloat(form.salaryRangeMax) : null,
        bio: form.bio || null,
        preferredActivities: form.preferredActivities,
        resumeLink: form.resumeLink || null,
        githubLink: form.githubLink || null,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-slate-400">Loading profile...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div className="rounded-xl border border-primary/20 bg-[#1a130c]/30 p-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Photo</label>
          <div className="flex items-center gap-4">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="h-20 w-20 rounded-lg object-cover border border-primary/20" />
            ) : (
              <div className="h-20 w-20 rounded-lg border border-primary/20 bg-[#0a0a0a] flex items-center justify-center text-slate-500 text-xs">No photo</div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="photo"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const fd = new FormData()
                fd.append('file', file)
                await api.post('/me/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
                fetchPhoto()
                e.target.value = ''
              }}
            />
            <label htmlFor="photo" className="rounded-lg h-10 px-4 border border-primary/30 text-primary text-sm font-medium flex items-center cursor-pointer hover:bg-primary/10">
              Choose file
            </label>
          </div>
        </div>

        {['resumeLink', 'githubLink', 'yearsExperience', 'currentCompany', 'targetCompanies', 'salaryRangeMin', 'salaryRangeMax', 'bio'].map((key) => {
          const labels: Record<string, string> = {
            resumeLink: 'Resume link',
            githubLink: 'GitHub',
            yearsExperience: 'Years of experience',
            currentCompany: 'Current company',
            targetCompanies: 'Target companies',
            salaryRangeMin: 'Salary min',
            salaryRangeMax: 'Salary max',
            bio: 'Bio',
          }
          const isUrl = key === 'resumeLink' || key === 'githubLink'
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-300 mb-1">{labels[key]}</label>
              {key === 'bio' ? (
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  className="w-full rounded-lg px-4 py-3 bg-[#0a0a0a] border border-primary/20 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
                  rows={3}
                />
              ) : (
                <input
                  type={isUrl ? 'url' : key.includes('salary') || key.includes('Experience') ? 'number' : 'text'}
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full rounded-lg h-11 px-4 bg-[#0a0a0a] border border-primary/20 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary"
                  placeholder={key === 'targetCompanies' ? 'e.g. Google, Stripe' : key === 'githubLink' ? 'https://github.com/...' : ''}
                />
              )}
            </div>
          )
        })}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Preferred activities</label>
          <div className="flex flex-wrap gap-3">
            {ACTIVITIES.map((a) => (
              <label key={a} className="inline-flex items-center gap-2 text-slate-100 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.preferredActivities.includes(a)}
                  onChange={() => toggleActivity(a)}
                  className="rounded border-primary/30 bg-[#0a0a0a] text-primary"
                />
                <span className="capitalize">{a}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="rounded-lg h-12 px-6 bg-primary text-[#0a0a0a] font-bold hover:brightness-110 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
