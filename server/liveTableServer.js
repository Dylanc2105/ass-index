import express from 'express'
import cors from 'cors'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { sanitizeLiveTable } from '../src/utils/liveTable.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_PATH =
  process.env.LIVE_TABLE_PATH ||
  path.resolve(__dirname, '../live-data/live-table.json')
const ADMIN_TOKEN = process.env.LIVE_TABLE_TOKEN || process.env.ADMIN_TOKEN || ''
const PORT = process.env.PORT || 4000

const ensureDataFile = async () => {
  const dir = path.dirname(DATA_PATH)
  await mkdir(dir, { recursive: true })
  try {
    await readFile(DATA_PATH, 'utf8')
  } catch {
    await writeFile(
      DATA_PATH,
      JSON.stringify(
        {
          better: [],
          worse: [],
          history: [],
          updatedAt: null,
        },
        null,
        2,
      ),
      'utf8',
    )
  }
}

const loadLiveTable = async () => {
  await ensureDataFile()
  const raw = await readFile(DATA_PATH, 'utf8')
  return sanitizeLiveTable(JSON.parse(raw))
}

const saveLiveTable = async (next) => {
  const sanitized = sanitizeLiveTable(next)
  await ensureDataFile()
  await writeFile(DATA_PATH, JSON.stringify(sanitized, null, 2), 'utf8')
  return sanitized
}

const requireAdminToken = (req, res, next) => {
  if (!ADMIN_TOKEN) {
    next()
    return
  }
  const header = req.get('x-admin-token') || ''
  if (header && header === ADMIN_TOKEN) {
    next()
    return
  }
  res.status(401).json({ message: 'Missing or invalid admin token' })
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/live-table', async (req, res) => {
  try {
    const table = await loadLiveTable()
    res.json(table)
  } catch (err) {
    res
      .status(500)
      .json({ message: err instanceof Error ? err.message : 'Failed to read live table' })
  }
})

app.put('/live-table', requireAdminToken, async (req, res) => {
  try {
    const saved = await saveLiveTable(req.body || {})
    res.json(saved)
  } catch (err) {
    res
      .status(500)
      .json({ message: err instanceof Error ? err.message : 'Failed to write live table' })
  }
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Live table server running on http://localhost:${PORT}/live-table`)
})
