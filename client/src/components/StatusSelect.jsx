import { STATUSES } from '../utils'

// A dropdown styled as a colored status badge.
export default function StatusSelect({ value, onChange }) {
  return (
    <select
      className={`status-select status-${value}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      aria-label="Status"
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
