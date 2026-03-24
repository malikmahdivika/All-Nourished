import bcrypt from 'bcryptjs'
import { get, initDb, run } from './db.js'

export async function seedSampleData() {
  await initDb()

  const existing = await get('SELECT id FROM users WHERE email = ?', ['demo@allnourished.dev'])
  if (!existing) {
    const passwordHash = await bcrypt.hash('demo1234', 10)
    const user = await run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      ['demo-player', 'demo@allnourished.dev', passwordHash]
    )

    await run('INSERT INTO scores (user_id, score, survival_time) VALUES (?, ?, ?)', [user.lastID, 45, 52])
    await run('INSERT INTO scores (user_id, score, survival_time) VALUES (?, ?, ?)', [user.lastID, 90, 101])
  }
}
