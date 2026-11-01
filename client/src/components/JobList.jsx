import Avatar from './Avatar'
import StatusSelect from './StatusSelect'
import { formatDate } from '../utils'

export default function JobList({ jobs, onOpen, onStatusChange }) {
  return (
    <div className="card job-list">
      <div className="job-row job-head" aria-hidden="true">
        <span>Company</span>
        <span>Status</span>
        <span>Applied</span>
        <span>Last update</span>
      </div>
      {jobs.map((job) => (
        <div
          key={job.id}
          className="job-row"
          role="button"
          tabIndex={0}
          onClick={() => onOpen(job)}
          onKeyDown={(e) => e.key === 'Enter' && onOpen(job)}
        >
          <div className="job-main">
            <Avatar name={job.company} />
            <div className="job-text">
              <div className="job-company">
                {job.company}
                {job.source === 'gmail' && <span className="tag">Gmail</span>}
                {job.source === 'linkedin' && <span className="tag tag-linkedin">LinkedIn</span>}
              </div>
              <div className="job-position">{job.position}</div>
            </div>
          </div>
          <div className="job-status">
            <StatusSelect value={job.status} onChange={(status) => onStatusChange(job, status)} />
          </div>
          <div className="job-cell">
            <span className="cell-label">Applied</span>
            {formatDate(job.appliedAt)}
          </div>
          <div className="job-cell">
            <span className="cell-label">Updated</span>
            {formatDate(job.updatedAt)}
          </div>
        </div>
      ))}
    </div>
  )
}
