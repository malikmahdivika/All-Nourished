import { useState } from 'react'

const initialForm = {
  username: '',
  email: '',
  password: '',
}

export default function LoginScreen({ error, onBack, onSubmit }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(mode, form)
  }

  return (
    <div className="screen info-screen">
      <div className="info-card login-card">
        <h2>{mode === 'login' ? 'log in' : 'create account'}</h2>
        <div className="auth-toggle">
          <button className={mode === 'login' ? 'active-toggle' : ''} onClick={() => setMode('login')}>Log in</button>
          <button className={mode === 'register' ? 'active-toggle' : ''} onClick={() => setMode('register')}>Register</button>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label>
              Username
              <input name="username" value={form.username} onChange={updateField} required />
            </label>
          ) : null}
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={updateField} required />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit">{mode === 'login' ? 'enter kitchen' : 'create account'}</button>
        </form>
        <button className="secondary-button" onClick={onBack}>Back</button>
      </div>
    </div>
  )
}
