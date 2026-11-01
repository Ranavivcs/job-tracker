import Avatar from './Avatar'
import { STATUSES, countByStatus, formatDate } from '../utils'

export default function Overview({ jobs, onOpen }) {
  const counts = countByStatus(jobs)
  const total = jobs.length
  const responded = total - counts.applied
  const rate = total ? Math.round((responded / total) * 100) : 0
  const firstApplied = jobs.map((j) => j.appliedAt).filter(Boolean).sort()[0]
  const interviewing = jobs.filter((j) => j.status === 'interview')

  const metrics = [
    { label: 'Total applications', value: total, hint: firstApplied ? `Since ${formatDate(firstApplied)}` : 'None yet' },
    { label: 'Waiting to hear back', value: counts.applied, hint: 'No reply yet' },
    { label: 'Interviewing', value: counts.interview, hint: counts.offer ? `${counts.offer} offer${counts.offer > 1 ? 's' : ''}` : 'Active processes' },
    { label: 'Response rate', value: `${rate}%`, hint: `${responded} of ${total} replied` },
  ]

  return (
    <section className="overview">
      <div className="metrics">
        {metrics.map((m) => (
          <div key={m.label} className="card metric">
            <span className="metric-label">{m.label}</span>
            <span className="metric-value">{m.value}</span>
            <span className="metric-hint">{m.hint}</span>
          </div>
        ))}
      </div>

      <div className="overview-row">
        <div className="card pipeline">
          <div className="card-title">Pipeline</div>
          <div className="pipeline-bar">
            {STATUSES.filter((s) => counts[s.value] > 0).map((s) => (
              <span
                key={s.value}
                className={`seg seg-${s.value}`}
                style={{ flexGrow: counts[s.value] }}
                title={`${s.label}: ${counts[s.value]}`}
              />
            ))}
          </div>
          <div className="legend">
            {STATUSES.map((s) => (
              <span key={s.value} className="legend-item">
                <span className={`dot dot-${s.value}`} />
                {s.label}
                <strong>{counts[s.value]}</strong>
                <span className="legend-pct">{total ? Math.round((counts[s.value] / total) * 100) : 0}%</span>
              </span>
            ))}
          </div>
        </div>

        <div className="card active-list">
          <div className="card-title">In progress</div>
          {interviewing.length === 0 ? (
            <p className="muted small">No active interviews right now.</p>
          ) : (
            <ul>
              {interviewing.map((job) => (
                <li key={job.id}>
                  <button className="active-item" onClick={() => onOpen(job)}>
                    <Avatar name={job.company} size={30} />
                    <span className="active-text">
                      <span className="active-company">{job.company}</span>
                      <span className="active-position">{job.position}</span>
                    </span>
                    <span className="active-date">{formatDate(job.updatedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
