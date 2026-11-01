import { useEffect, useState } from 'react'
import Avatar from './Avatar'
import StatusSelect from './StatusSelect'
import { formatDate, formatDateTime, gmailThreadUrl } from '../utils'

export default function JobDrawer({ job, onClose, onUpdate, onEdit, onDelete }) {
  // The parent renders this with key={job.id}, so opening another job starts fresh.
  const [notes, setNotes] = useState(job.notes)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const events = [...(job.events || [])].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="overlay overlay-drawer" onMouseDown={onClose}>
      <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
        <div className="drawer-top">
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="drawer-title">
          <Avatar name={job.company} size={48} />
          <div>
            <h2>{job.company}</h2>
            <p className="muted">{job.position}</p>
          </div>
        </div>

        <StatusSelect value={job.status} onChange={(status) => onUpdate(job, { status })} />

        <dl className="details">
          <dt>Applied</dt>
          <dd>{formatDate(job.appliedAt)}</dd>
          <dt>Location</dt>
          <dd>{job.location || '—'}</dd>
          <dt>Job link</dt>
          <dd>
            {job.url ? (
              <a href={job.url} target="_blank" rel="noreferrer">
                Open posting ↗
              </a>
            ) : (
              '—'
            )}
          </dd>
          <dt>Source</dt>
          <dd>
            {{ gmail: 'Imported from Gmail', linkedin: 'Imported from LinkedIn' }[job.source] ?? 'Added manually'}
            {job.gmailThreadId && (
              <>
                {' · '}
                <a href={gmailThreadUrl(job.gmailThreadId)} target="_blank" rel="noreferrer">
                  Open email ↗
                </a>
              </>
            )}
          </dd>
        </dl>

        <label className="notes">
          Notes
          <textarea
            rows={4}
            value={notes}
            placeholder="Recruiter name, salary range, next steps…"
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== job.notes && onUpdate(job, { notes })}
          />
        </label>

        {events.length > 0 && (
          <div className="timeline">
            <h3>Timeline</h3>
            <ol>
              {events.map((event, i) => (
                <li key={i}>
                  <span className="timeline-date">{formatDateTime(event.date)}</span>
                  <span>{event.text}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="drawer-actions">
          <button className="btn" onClick={() => onEdit(job)}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(job)}>
            Delete
          </button>
        </div>
      </aside>
    </div>
  )
}
