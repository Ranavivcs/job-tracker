import { STATUSES, countByStatus, formatDateTime } from '../utils'

export default function Sidebar({ jobs, filter, onFilter, lastGmailSync }) {
  const counts = countByStatus(jobs)
  const items = [
    { value: 'all', label: 'All applications', count: jobs.length },
    ...STATUSES.map((s) => ({ ...s, count: counts[s.value] })),
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">JT</span>
        <span className="brand-name">Job Tracker</span>
      </div>

      <nav className="nav" aria-label="Filter by status">
        <span className="nav-heading">Pipeline</span>
        {items.map((item) => (
          <button
            key={item.value}
            className={`nav-item ${filter === item.value ? 'active' : ''}`}
            onClick={() => onFilter(item.value)}
          >
            <span className={`dot dot-${item.value}`} />
            <span className="nav-label">{item.label}</span>
            <span className="nav-count">{item.count}</span>
          </button>
        ))}
      </nav>

      <div className="sync-card">
        <div className="sync-title">
          <span className="sync-dot" /> Gmail
        </div>
        <div className="sync-time">
          {lastGmailSync ? `Synced ${formatDateTime(lastGmailSync)}` : 'Not synced yet'}
        </div>
        <div className="sync-hint">Ask Claude to “sync my jobs” to pull in new emails.</div>
      </div>
    </aside>
  )
}
