const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('./allnourished.db')

db.serialize(() => {
  db.all('SELECT id, username, email, password_hash FROM users', (err, rows) => {
    if (err) {
      console.error('users err', err)
    } else {
      console.log('USERS', rows)
    }
  })

  db.all('SELECT * FROM user_progress', (err, rows) => {
    if (err) {
      console.error('progress err', err)
    } else {
      console.log('PROGRESS', rows)
    }
  })
})

db.close()
