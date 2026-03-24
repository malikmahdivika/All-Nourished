import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { all, get, initDb, run } from './db.js'
import { makeToken, requireAuth } from './auth.js'
import { seedSampleData } from './seed.js'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

function sanitizeText(value, maxLength = 60) {
  return String(value || '').trim().slice(0, maxLength)
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.post('/api/auth/register', async (request, response) => {
  try {
    const username = sanitizeText(request.body.username, 25)
    const email = sanitizeText(request.body.email, 120).toLowerCase()
    const password = String(request.body.password || '')

    if (!username || !email || password.length < 6) {
      return response
        .status(400)
        .json({ error: 'provide username, email, and a password with at least 6 characters.' })
    }

    const existing = await get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    )

    if (existing) {
      return response
        .status(409)
        .json({ error: 'that email or username is already in use.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    )

    const user = { id: result.lastID, username, email }
    const token = makeToken(user)

    return response.status(201).json({ token, user })
  } catch (error) {
    console.error(error)
    return response.status(500).json({ error: 'failed to register user.' })
  }
})

app.post('/api/auth/login', async (request, response) => {
  try {
    const email = sanitizeText(request.body.email, 120).toLowerCase()
    const password = String(request.body.password || '')
    const user = await get('SELECT * FROM users WHERE email = ?', [email])

    if (!user) {
      return response.status(401).json({ error: 'invalid email or password.' })
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      return response.status(401).json({ error: 'invalid email or password.' })
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
    }

    const token = makeToken(safeUser)
    return response.json({ token, user: safeUser })
  } catch (error) {
    console.error(error)
    return response.status(500).json({ error: 'failed to log in.' })
  }
})

app.get('/api/leaderboard', async (_request, response) => {
  try {
    const entries = await all(`
      SELECT scores.id, users.username, scores.score, scores.survival_time, scores.created_at
      FROM scores
      INNER JOIN users ON users.id = scores.user_id
      ORDER BY scores.score DESC, scores.survival_time DESC, scores.created_at DESC
      LIMIT 10
    `)

    return response.json({ entries })
  } catch (error) {
    console.error(error)
    return response.status(500).json({ error: 'failed to fetch leaderboard.' })
  }
})

app.post('/api/scores', requireAuth, async (request, response) => {
  try {
    const score = Number(request.body.score)
    const survivalTime = Number(request.body.survivalTime)

    if (!Number.isFinite(score) || !Number.isFinite(survivalTime)) {
      return response.status(400).json({ error: 'invalid score payload.' })
    }

    const cleanScore = Math.max(0, Math.floor(score))
    const cleanTime = Math.max(0, Math.floor(survivalTime))

    const result = await run(
      'INSERT INTO scores (user_id, score, survival_time) VALUES (?, ?, ?)',
      [request.user.id, cleanScore, cleanTime]
    )

    return response.status(201).json({
      ok: true,
      scoreId: result.lastID,
      savedScore: cleanScore,
      savedTime: cleanTime,
    })
  } catch (error) {
    console.error(error)
    return response.status(500).json({ error: 'failed to save score.' })
  }
})

async function start() {
  await initDb()
  await seedSampleData()

  app.listen(port, () => {
    console.log(`allnourished backend running on http://localhost:${port}`)
  })
}

start().catch((error) => {
  console.error('failed to start server', error)
  process.exit(1)
})