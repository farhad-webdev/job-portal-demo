import { useEffect, useMemo, useState } from 'react'
import { jobs, categories, locations, jobTypes, salaryRanges } from './data/jobs.js'

const STORAGE_KEY = 'job-portal-demo-applications'

function loadApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function typeBadge(type) {
  const map = {
    'Full-time': 'bg-blue-100 text-blue-800',
    'Part-time': 'bg-purple-100 text-purple-800',
    Remote: 'bg-emerald-100 text-emerald-800',
    Contract: 'bg-amber-100 text-amber-800',
  }
  return map[type] || 'bg-slate-100 text-slate-800'
}

export default function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All Locations')
  const [jobType, setJobType] = useState('All Types')
  const [salaryIdx, setSalaryIdx] = useState(0)
  const [selectedJob, setSelectedJob] = useState(null)
  const [applyJob, setApplyJob] = useState(null)
  const [showApplications, setShowApplications] = useState(false)
  const [applications, setApplications] = useState(loadApplications)
  const [form, setForm] = useState({ name: '', email: '', phone: '', cvLink: '', coverLetter: '' })
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  }, [applications])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const range = salaryRanges[salaryIdx]
    return jobs.filter((job) => {
      if (q) {
        const hay = `${job.title} ${job.company} ${job.location} ${job.category} ${job.tags.join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (category !== 'All' && job.category !== category) return false
      if (location !== 'All Locations' && job.location !== location) return false
      if (jobType !== 'All Types' && job.type !== jobType) return false
      // Salary overlap: job range overlaps selected range
      if (job.salaryMax < range.min || job.salaryMin > range.max) return false
      return true
    })
  }, [search, category, location, jobType, salaryIdx])

  function openApply(job) {
    setApplyJob(job)
    setSelectedJob(null)
    setForm({ name: '', email: '', phone: '', cvLink: '', coverLetter: '' })
    setFormError('')
    setFormSuccess('')
  }

  function submitApply(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('Please fill name, email and phone.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setFormError('Please enter a valid email address.')
      return
    }
    const already = applications.some((a) => a.jobId === applyJob.id && a.email.toLowerCase() === form.email.trim().toLowerCase())
    if (already) {
      setFormError('You have already applied to this job with this email.')
      return
    }
    const app = {
      id: Date.now(),
      jobId: applyJob.id,
      jobTitle: applyJob.title,
      company: applyJob.company,
      location: applyJob.location,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      cvLink: form.cvLink.trim(),
      coverLetter: form.coverLetter.trim(),
      status: 'Pending',
      appliedAt: new Date().toISOString().slice(0, 10),
    }
    setApplications((prev) => [app, ...prev])
    setFormSuccess(`Application submitted for ${applyJob.title} at ${applyJob.company}.`)
    setForm({ name: '', email: '', phone: '', cvLink: '', coverLetter: '' })
  }

  function clearFilters() {
    setSearch('')
    setCategory('All')
    setLocation('All Locations')
    setJobType('All Types')
    setSalaryIdx(0)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">J</div>
            <div>
              <h1 className="text-xl font-bold leading-tight">JobPortal Demo</h1>
              <p className="text-xs text-slate-500">Jobs in Bangladesh &amp; Remote — Demo</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowApplications(false) }}
              placeholder="Search job, company, skill…"
              className="flex-1 md:w-80 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setShowApplications((v) => !v)}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800"
            >
              My Applications ({applications.length})
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-3xl md:text-4xl font-bold">Find your next job</h2>
          <p className="mt-2 text-blue-100 max-w-2xl">
            Browse {jobs.length} demo jobs from Dhaka, Chattogram and remote teams. Filter by category, location and salary — then apply in one minute.
            <span className="block mt-1 text-sm text-blue-200">Demo only: jobs are mock data. Applications are saved in your browser (localStorage).</span>
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <span className="bg-white/15 px-3 py-1.5 rounded-full">🇧🇩 Dhaka &amp; Chattogram</span>
            <span className="bg-white/15 px-3 py-1.5 rounded-full">🌍 Remote roles</span>
            <span className="bg-white/15 px-3 py-1.5 rounded-full">✉️ Apply from this portal</span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {showApplications ? (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Applications</h2>
              <button onClick={() => setShowApplications(false)} className="text-sm text-blue-600 hover:underline">← Back to jobs</button>
            </div>
            {applications.length === 0 ? (
              <div className="bg-white border rounded-2xl p-8 text-center text-slate-500">
                No applications yet. Browse jobs and click Apply.
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((a) => (
                  <div key={a.id} className="bg-white border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{a.jobTitle}</h3>
                      <p className="text-sm text-slate-500">{a.company} • {a.location} • Applied {a.appliedAt}</p>
                      <p className="text-sm text-slate-600 mt-1">{a.name} • {a.email} • {a.phone}</p>
                      {a.cvLink && <a href={a.cvLink} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">CV / Portfolio link ↗</a>}
                    </div>
                    <span className="self-start md:self-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Filters */}
            <section className="bg-white border rounded-2xl p-4 mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3.5 py-1.5 rounded-full text-sm border ${category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 hover:border-blue-300'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Location</span>
                  <select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 bg-white">
                    {locations.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Job type</span>
                  <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2.5 bg-white">
                    {jobTypes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Salary range</span>
                  <select value={salaryIdx} onChange={(e) => setSalaryIdx(Number(e.target.value))} className="mt-1 w-full border rounded-xl px-3 py-2.5 bg-white">
                    {salaryRanges.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
                  </select>
                </label>
                <div className="flex items-end">
                  <button onClick={clearFilters} className="w-full px-4 py-2.5 border rounded-xl text-sm hover:bg-slate-50">Clear filters</button>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{filtered.length} job{filtered.length !== 1 ? 's' : ''} found</h2>
              <p className="text-sm text-slate-500 hidden sm:block">Click a job to see details</p>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border rounded-2xl p-10 text-center">
                <p className="font-medium">No jobs match your filters.</p>
                <p className="text-sm text-slate-500 mt-1">Try a different keyword, location or salary range.</p>
                <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm">Clear filters</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((job) => (
                  <article key={job.id} className="bg-white border rounded-2xl p-5 flex flex-col hover:shadow-lg transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">{initials(job.company)}</div>
                        <div>
                          <h3 className="font-semibold leading-tight">{job.title}</h3>
                          <p className="text-sm text-slate-500">{job.company}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${typeBadge(job.type)}`}>{job.type}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.tags.map((t) => <span key={t} className="text-xs bg-slate-100 px-2 py-1 rounded-full">{t}</span>)}
                    </div>
                    <div className="text-sm text-slate-600 mt-4 space-y-1">
                      <p>📍 {job.location} • {job.category} • {job.experience}</p>
                      <p className="font-semibold text-slate-900">💰 {job.salaryLabel}</p>
                      <p className="text-xs text-slate-400">Posted {job.postedDaysAgo} day{job.postedDaysAgo !== 1 ? 's' : ''} ago • Deadline {job.deadline}</p>
                    </div>
                    <div className="flex gap-2 mt-5 pt-4 border-t">
                      <button onClick={() => setSelectedJob(job)} className="flex-1 px-3 py-2 border rounded-xl text-sm font-medium hover:bg-slate-50">View details</button>
                      <button onClick={() => openApply(job)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">Apply now</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Job details modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">{selectedJob.title}</h3>
                <p className="text-slate-500">{selectedJob.company} • {selectedJob.location} • {selectedJob.type}</p>
                <p className="font-semibold mt-2">{selectedJob.salaryLabel}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-2xl leading-none">×</button>
            </div>
            <p className="text-slate-700 mt-4">{selectedJob.description}</p>
            <h4 className="font-semibold mt-5 mb-2">Requirements</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              {selectedJob.requirements.map((r) => <li key={r}>{r}</li>)}
            </ul>
            <h4 className="font-semibold mt-5 mb-2">About {selectedJob.company}</h4>
            <p className="text-slate-700">{selectedJob.aboutCompany}</p>
            <p className="text-sm text-slate-500 mt-2">{selectedJob.companySize} • {selectedJob.website} • Deadline {selectedJob.deadline}</p>
            <div className="flex gap-2 mt-6">
              <button onClick={() => openApply(selectedJob)} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium">Apply for this job</button>
              <button onClick={() => setSelectedJob(null)} className="px-4 py-2.5 border rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Apply modal */}
      {applyJob && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setApplyJob(null)}>
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Apply — {applyJob.title}</h3>
                <p className="text-slate-500">{applyJob.company} • {applyJob.location}</p>
              </div>
              <button onClick={() => setApplyJob(null)} className="text-2xl leading-none">×</button>
            </div>
            {formSuccess ? (
              <div className="mt-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
                <p className="font-medium">✅ {formSuccess}</p>
                <p className="text-sm mt-1">Saved in My Applications (localStorage). This is a demo — no email was sent.</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setApplyJob(null); setShowApplications(true) }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm">View My Applications</button>
                  <button onClick={() => setApplyJob(null)} className="px-4 py-2 border rounded-xl text-sm">Back to jobs</button>
                </div>
              </div>
            ) : (
              <form onSubmit={submitApply} className="mt-5 space-y-3">
                {formError && <p className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2 text-sm">{formError}</p>}
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name *" className="w-full border rounded-xl px-3 py-2.5" />
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email *" className="w-full border rounded-xl px-3 py-2.5" />
                <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone *" className="w-full border rounded-xl px-3 py-2.5" />
                <input value={form.cvLink} onChange={(e) => setForm({ ...form, cvLink: e.target.value })} placeholder="CV / Portfolio link (Google Drive, GitHub…)" className="w-full border rounded-xl px-3 py-2.5" />
                <textarea value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} placeholder="Cover letter (optional)" rows={4} className="w-full border rounded-xl px-3 py-2.5" />
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium">Submit application</button>
                <p className="text-xs text-slate-400 text-center">Demo: saved only in this browser. No file upload — paste a Drive link instead.</p>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-slate-300 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between gap-4 text-sm">
          <div>
            <p className="text-white font-bold">JobPortal Demo</p>
            <p className="mt-1">Demo job portal for Farhad — mock data, no backend.</p>
          </div>
          <div>
            <p>Categories: IT • Marketing • Design • Accounting • Support • Sales</p>
            <p className="mt-1">© 2026 JobPortal Demo. Built with Vite + React + Tailwind.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
