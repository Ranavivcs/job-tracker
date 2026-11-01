import { useCallback, useEffect, useMemo, useState } from 'react'
import { createJob, deleteJob, getJobs, updateJob } from './api'
import { STATUSES, statusLabel } from './utils'
import Sidebar from './components/Sidebar'
import Overview from './components/Overview'
import JobList from './components/JobList'
import JobForm from './components/JobForm'
import JobDrawer from './components/JobDrawer'

const SORTS = {
  updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  applied: (a, b) => (b.appliedAt || '').localeCompare(a.appliedAt || ''),
  company: (a, b) => a.company.localeCompare(b.company),
}

export default function App() {
  const [jobs, setJobs] = useState([])
  const [lastGmailSync, setLastGmailSync] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('updated')

  const [formJob, setFormJob] = useState(null) // null = closed, {} = new job, job = edit
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await getJobs()
      setJobs(data.jobs)
      setLastGmailSync(data.lastGmailSync)
      setError(null)
    } catch {
      setError("Can't reach the server. Is it running on port 3001?")
    } finally {
      setLoading(false)
    }
  }, [])

  // Load on start, and reload whenever you come back to the tab, so a Gmail sync shows up.
  useEffect(() => {
    load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  async function run(action) {
    try {
      await action()
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  function replaceJob(updated) {
    setJobs((current) => current.map((j) => (j.id === updated.id ? updated : j)))
  }

  const handleSave = (values) =>
    run(async () => {
      if (values.id) {
        replaceJob(await updateJob(values.id, values))
      } else {
        const created = await createJob(values)
        setJobs((current) => [created, ...current])
      }
      setFormJob(null)
    })

  const handleUpdate = (job, changes) => run(async () => replaceJob(await updateJob(job.id, changes)))

  const handleDelete = (job) => {
    if (!window.confirm(`Delete ${job.company} – ${job.position}?`)) return
    run(async () => {
      await deleteJob(job.id)
      setJobs((current) => current.filter((j) => j.id !== job.id))
      setSelectedId(null)
    })
  }

  const visibleJobs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs
      .filter((j) => filter === 'all' || j.status === filter)
      .filter((j) => !q || `${j.company} ${j.position} ${j.location} ${j.notes}`.toLowerCase().includes(q))
      .sort(SORTS[sort])
  }, [jobs, filter, search, sort])

  const selectedJob = jobs.find((j) => j.id === selectedId)
  const closeForm = useCallback(() => setFormJob(null), [])
  const closeDrawer = useCallback(() => setSelectedId(null), [])

  const title = filter === 'all' ? 'All applications' : statusLabel(filter)

  return (
    <div className="shell">
      <Sidebar jobs={jobs} filter={filter} onFilter={setFilter} lastGmailSync={lastGmailSync} />

      <main className="main">
      <header className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormJob({})}>
          <span aria-hidden="true">＋</span> Add job
        </button>
      </header>

      {error && (
        <div className="banner" role="alert">
          {error}
          <button className="icon-btn" onClick={() => setError(null)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}

      <Overview jobs={jobs} onOpen={(job) => setSelectedId(job.id)} />

      <div className="list-header">
        <div>
          <h2>{title}</h2>
          <span className="muted small">
            {visibleJobs.length} of {jobs.length}
          </span>
        </div>
        <div className="toolbar">
          <label className="search">
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
              <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              placeholder="Search company, role, notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select className="sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
            <option value="updated">Recently updated</option>
            <option value="applied">Date applied</option>
            <option value="company">Company A–Z</option>
          </select>
        </div>
      </div>

      <div className="filter-pills" role="tablist" aria-label="Filter by status">
        {[{ value: 'all', label: 'All' }, ...STATUSES].map((s) => (
          <button
            key={s.value}
            className={`pill ${filter === s.value ? 'active' : ''}`}
            onClick={() => setFilter(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="empty muted">Loading…</p>
      ) : visibleJobs.length > 0 ? (
        <JobList
          jobs={visibleJobs}
          onOpen={(job) => setSelectedId(job.id)}
          onStatusChange={(job, status) => handleUpdate(job, { status })}
        />
      ) : (
        <div className="empty">
          <p>{jobs.length ? 'No jobs match this filter.' : 'No applications yet.'}</p>
          {!jobs.length && (
            <button className="btn btn-primary" onClick={() => setFormJob({})}>
              Add your first job
            </button>
          )}
        </div>
      )}
      </main>

      {formJob &&<JobForm initial={formJob} onSave={handleSave} onCancel={closeForm} />}

      {selectedJob && (
        <JobDrawer
          key={selectedJob.id}
          job={selectedJob}
          onClose={closeDrawer}
          onUpdate={handleUpdate}
          onEdit={(job) => setFormJob(job)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
