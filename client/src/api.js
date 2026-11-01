const BASE = '/api/jobs'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

export const getJobs = () => request(BASE)

export const createJob = (job) =>
  request(BASE, { method: 'POST', body: JSON.stringify(job) })

export const updateJob = (id, changes) =>
  request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })

export const deleteJob = (id) => request(`${BASE}/${id}`, { method: 'DELETE' })
