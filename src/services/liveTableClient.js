import { sanitizeLiveTable } from '../utils/liveTable.js'

const API_URL = import.meta.env.VITE_LIVE_TABLE_API || '/api/live-table'
const API_KEY =
  import.meta.env.VITE_LIVE_TABLE_API_KEY || import.meta.env.VITE_LIVE_TABLE_KEY || ''

const buildHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  }
  if (API_KEY) {
    headers['x-admin-token'] = API_KEY
  }
  return headers
}

export const fetchLiveTableRemote = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: buildHeaders(),
  })
  if (!response.ok) {
    throw new Error(`Live table request failed (${response.status})`)
  }
  const data = await response.json()
  return sanitizeLiveTable(data)
}

export const saveLiveTableRemote = async (payload) => {
  const sanitized = sanitizeLiveTable(payload)
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(sanitized),
  })
  if (!response.ok) {
    throw new Error(`Unable to save live table (${response.status})`)
  }
  const data = await response.json().catch(() => sanitized)
  return sanitizeLiveTable(data || sanitized)
}
