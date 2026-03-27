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

const ACHIEVEMENT_DEFINITIONS = [
  { key: 'serve_10', title: 'Serve 10 meals', description: 'Serve 10 total meals.' },
  { key: 'serve_100', title: 'Serve 100 meals', description: 'Serve 100 total meals.' },
  { key: 'survive_60', title: 'Survive 1 minute', description: 'Survive 60 seconds in a single game session.' },
]

async function getUserProgress(userId) {
  const progress = await get('SELECT * FROM user_progress WHERE user_id = ?', [userId])
  if (!progress) {
    const defaultProgress = { user_id: userId, total_meals_served: 0, total_survival_time: 0, current_level: 1 }
    await run(
      'INSERT OR IGNORE INTO user_progress (user_id, total_meals_served, total_survival_time, current_level) VALUES (?, ?, ?, ?)',
      [userId, 0, 0, 1]
    )
    return defaultProgress
  }
  return progress
}

async function getUsersAchievements(userId) {
  const rows = await all('SELECT achievement_key, unlocked_at FROM user_achievements WHERE user_id = ?', [userId])
  return rows.reduce((acc, row) => {
    acc[row.achievement_key] = row.unlocked_at
    return acc
  }, {})
}

async function updateUserProgress(userId, sessionMealsServed, sessionSurvivalTime) {
  const progress = await getUserProgress(userId)

  const totalMealsServed = progress.total_meals_served + sessionMealsServed
  const totalSurvivalTime = progress.total_survival_time + sessionSurvivalTime
  const newLevel = Math.max(1, Math.floor(totalMealsServed / 10) + 1)

  await run(
    'UPDATE user_progress SET total_meals_served = ?, total_survival_time = ?, current_level = ? WHERE user_id = ?',
    [totalMealsServed, totalSurvivalTime, newLevel, userId]
  )

  const existingAchievements = await getUsersAchievements(userId)
  const newlyUnlocked = []

  if (totalMealsServed >= 10 && !existingAchievements.serve_10) {
    await run('INSERT OR IGNORE INTO user_achievements (user_id, achievement_key) VALUES (?, ?)', [userId, 'serve_10'])
    newlyUnlocked.push('serve_10')
  }

  if (totalMealsServed >= 100 && !existingAchievements.serve_100) {
    await run('INSERT OR IGNORE INTO user_achievements (user_id, achievement_key) VALUES (?, ?)', [userId, 'serve_100'])
    newlyUnlocked.push('serve_100')
  }

  if (sessionSurvivalTime >= 60 && !existingAchievements.survive_60) {
    await run('INSERT OR IGNORE INTO user_achievements (user_id, achievement_key) VALUES (?, ?)', [userId, 'survive_60'])
    newlyUnlocked.push('survive_60')
  }

  return {
    progress: { user_id: userId, total_meals_served: totalMealsServed, total_survival_time: totalSurvivalTime, current_level: newLevel },
    unlockedAchievements: newlyUnlocked,
  }
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
    await run(
      'INSERT INTO user_progress (user_id, total_meals_served, total_survival_time, current_level) VALUES (?, 0, 0, 1)',
      [user.id]
    )

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

app.get('/api/user/progress', requireAuth, async (request, response) => {
  try {
    const progress = await getUserProgress(request.user.id)
    const userAchievements = await getUsersAchievements(request.user.id)
    const achievements = ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
      ...achievement,
      unlocked: Boolean(userAchievements[achievement.key]),
      unlockedAt: userAchievements[achievement.key] || null,
    }))

    return response.json({ progress, achievements })
  } catch (error) {
    console.error(error)
    return response.status(500).json({ error: 'failed to fetch user progress.' })
  }
})

app.get('/api/achievements', (_request, response) => {
  return response.json({ achievements: ACHIEVEMENT_DEFINITIONS })
})

app.post('/api/scores', requireAuth, async (request, response) => {
  try {
    const score = Number(request.body.score)
    const survivalTime = Number(request.body.survivalTime)
    const mealsServed = Number(request.body.mealsServed ?? 0)

    if (!Number.isFinite(score) || !Number.isFinite(survivalTime) || !Number.isFinite(mealsServed)) {
      return response.status(400).json({ error: 'invalid score payload.' })
    }

    const cleanScore = Math.max(0, Math.floor(score))
    const cleanTime = Math.max(0, Math.floor(survivalTime))
    const cleanMeals = Math.max(0, Math.floor(mealsServed))

    const result = await run(
      'INSERT INTO scores (user_id, score, survival_time) VALUES (?, ?, ?)',
      [request.user.id, cleanScore, cleanTime]
    )

    const updateResult = await updateUserProgress(request.user.id, cleanMeals, cleanTime)

    return response.status(201).json({
      ok: true,
      scoreId: result.lastID,
      savedScore: cleanScore,
      savedTime: cleanTime,
      progress: updateResult.progress,
      unlockedAchievements: updateResult.unlockedAchievements,
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