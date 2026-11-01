const express = require('express')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const PORT = process.env.PORT || 3001
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'jobs.json')
const SAMPLE_FILE = path.join(__dirname, 'sample-jobs.json')
const STATUSES = ['applied', 'interview', 'offer', 'rejected']
const EDITABLE_FIELDS = ['company', 'position', 'status', 'appliedAt', 'location', 'url', 'notes']

// The data lives in a JSON file that is re-read on every request, so changes
// written to the file directly (like a Gmail sync) show up without a restart.
// On first run the file is created from the sample data.
function load() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    fs.copyFileSync(SAMPLE_FILE, DATA_FILE)
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
}

function save(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  const tmp = DATA_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, DATA_FILE)
}

function pickEditable(body) {
  const fields = {}
  for (const key of EDITABLE_FIELDS) {
    if (body[key] === undefined) continue
    fields[key] = typeof body[key] === 'string' ? body[key].trim() : body[key]
  }
  return fields
}

function validate(fields) {
  if ('company' in fields && !fields.company) return 'Company is required'
  if ('position' in fields && !fields.position) return 'Position is required'
  if ('status' in fields && !STATUSES.includes(fields.status)) {
    return `Status must be one of: ${STATUSES.join(', ')}`
  }
}

const app = express()
app.use(express.json())

app.get('/api/jobs', (req, res) => {
  res.json(load())
})

app.post('/api/jobs', (req, res) => {
  const now = new Date().toISOString()
  const fields = {
    company: '',
    position: '',
    status: 'applied',
    appliedAt: now.slice(0, 10),
    location: '',
    url: '',
    notes: '',
    ...pickEditable(req.body),
  }
  const error = validate(fields)
  if (error) return res.status(400).json({ error })

  const job = {
    id: crypto.randomUUID(),
    ...fields,
    source: 'manual',
    events: [{ date: now, text: `Added as ${fields.status}` }],
    createdAt: now,
    updatedAt: now,
  }
  const data = load()
  data.jobs.unshift(job)
  save(data)
  res.status(201).json(job)
})

app.patch('/api/jobs/:id', (req, res) => {
  const data = load()
  const job = data.jobs.find((j) => j.id === req.params.id)
  if (!job) return res.status(404).json({ error: 'Job not found' })

  const fields = pickEditable(req.body)
  const error = validate(fields)
  if (error) return res.status(400).json({ error })

  const now = new Date().toISOString()
  if (fields.status && fields.status !== job.status) {
    job.events = job.events || []
    job.events.push({ date: now, text: `Status changed to ${fields.status}` })
  }
  Object.assign(job, fields, { updatedAt: now })
  save(data)
  res.json(job)
})

app.delete('/api/jobs/:id', (req, res) => {
  const data = load()
  const before = data.jobs.length
  data.jobs = data.jobs.filter((j) => j.id !== req.params.id)
  if (data.jobs.length === before) return res.status(404).json({ error: 'Job not found' })
  save(data)
  res.status(204).end()
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`Job Tracker API running on http://localhost:${PORT}`)
})
