import { useEffect, useState } from 'react'
import { STATUSES } from '../utils'

const EMPTY = {
  company: '',
  position: '',
  status: 'applied',
  appliedAt: new Date().toISOString().slice(0, 10),
  location: '',
  url: '',
  notes: '',
}

export default function JobForm({ initial, onSave, onCancel }) {
  const [values, setValues] = useState({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(initial.id)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function set(field) {
    return (e) => setValues({ ...values, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(values)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="overlay" onMouseDown={onCancel}>
      <form className="modal" onSubmit={handleSubmit} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit job' : 'Add a job'}</h2>

        <div className="form-grid">
          <label>
            Company *
            <input value={values.company} onChange={set('company')} required autoFocus />
          </label>
          <label>
            Position *
            <input value={values.position} onChange={set('position')} required />
          </label>
          <label>
            Status
            <select value={values.status} onChange={set('status')}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Applied on
            <input type="date" value={values.appliedAt} onChange={set('appliedAt')} />
          </label>
          <label>
            Location
            <input value={values.location} onChange={set('location')} placeholder="Tel Aviv · Hybrid" />
          </label>
          <label>
            Job link
            <input type="url" value={values.url} onChange={set('url')} placeholder="https://" />
          </label>
          <label className="full">
            Notes
            <textarea rows={3} value={values.notes} onChange={set('notes')} />
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add job'}
          </button>
        </div>
      </form>
    </div>
  )
}
