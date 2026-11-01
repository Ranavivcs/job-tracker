export const STATUSES = [
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

export function statusLabel(value) {
  return STATUSES.find((s) => s.value === value)?.label ?? value
}

export function formatDate(value) {
  if (!value) return '—'
  // Plain "YYYY-MM-DD" strings are parsed as UTC; pin them to local noon so the day doesn't shift.
  const date = value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function countByStatus(jobs) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s.value, 0]))
  for (const job of jobs) counts[job.status] = (counts[job.status] ?? 0) + 1
  return counts
}

export function gmailThreadUrl(threadId) {
  return `https://mail.google.com/mail/u/0/#all/${threadId}`
}
