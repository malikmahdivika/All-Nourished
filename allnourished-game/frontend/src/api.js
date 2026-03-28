const API_BASE = import.meta.env.VITE_API_URL;

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'request failed.')
  }

  return data
}

export async function registerUser(username, email, password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  })

  return handleResponse(response)
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })

  return handleResponse(response)
}

export async function fetchLeaderboard() {
  const response = await fetch(`${API_BASE}/leaderboard`)
  return handleResponse(response)
}

export async function submitScore(token, score, timeSurvived, mealsServed) {
  const response = await fetch(`${API_BASE}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      score,
      survivalTime: timeSurvived,
      mealsServed,
    }),
  })

  return handleResponse(response)
}

export async function fetchUserProgress(token) {
  const response = await fetch(`${API_BASE}/user/progress`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return handleResponse(response)
}