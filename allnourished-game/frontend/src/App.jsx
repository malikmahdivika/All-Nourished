import { useEffect, useMemo, useState } from 'react'
import {
  fetchLeaderboard,
  fetchUserProgress,
  loginUser,
  registerUser,
  submitScore,
} from './api'
import StartScreen from './components/StartScreen'
import TutorialScreen from './components/TutorialScreen'
import LeaderboardScreen from './components/LeaderboardScreen'
import LoginScreen from './components/LoginScreen'
import CountdownScreen from './components/CountdownScreen'
import GameScreen from './components/GameScreen'
import GameOverScreen from './components/GameOverScreen'
import AchievementsScreen from './components/AchievementsScreen'

export default function App() {
  const [screen, setScreen] = useState('start')
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('allnourished-auth')
    return saved ? JSON.parse(saved) : { token: '', user: null }
  })
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [gameResult, setGameResult] = useState(null)
  const [saveStatus, setSaveStatus] = useState('')
  const [userProgress, setUserProgress] = useState({ total_meals_served: 0, current_level: 1 })
  const [userAchievements, setUserAchievements] = useState([])

  const isLoggedIn = Boolean(auth.token)
  const username = auth.user?.username || 'Guest'

  useEffect(() => {
    if (auth.token) {
      loadUserProgress(auth.token)
    }
  }, [auth.token])

  async function loadLeaderboard() {
    setLeaderboardLoading(true)
    try {
      const data = await fetchLeaderboard()
      setLeaderboard(data.entries || [])
    } catch (error) {
      setLeaderboard([])
    } finally {
      setLeaderboardLoading(false)
    }
  }

  async function loadUserProgress(token) {
    if (!token) return
    try {
      const data = await fetchUserProgress(token)
      setUserProgress(data.progress || { total_meals_served: 0, current_level: 1 })
      setUserAchievements(data.achievements || [])
    } catch (error) {
      console.error('unable to load user progress', error)
    }
  }

  const nav = useMemo(
    () => ({
      goStart: () => setScreen('start'),
      goTutorial: () => setScreen('tutorial'),
      goLogin: () => {
        setAuthError('')
        setScreen('login')
      },
      goLeaderboard: async () => {
        setScreen('leaderboard')
        await loadLeaderboard()
      },
      goAchievements: () => {
        setScreen('achievements')
      },
      startGame: () => {
        if (!isLoggedIn) {
          setAuthError('please log in before playing so your score can be saved.')
          setScreen('login')
          return
        }
        setSaveStatus('')
        setScreen('countdown')
      },
      beginGameplay: () => setScreen('game'),
      finishGame: async (result) => {
        setGameResult(result)
        setSaveStatus('saving score...')

        if (isLoggedIn) {
          try {
            const response = await submitScore(
              auth.token,
              result.score,
              result.timeSurvived,
              result.mealsServed
            )
            setSaveStatus('score saved successfully.')
            if (response.progress) {
              setUserProgress(response.progress)
            }
            if (response.unlockedAchievements) {
              loadUserProgress(auth.token)
            }
            await loadLeaderboard()
          } catch (error) {
            console.error(error)
            setSaveStatus(`score could not be saved: ${error.message}`)
          }
        } else {
          setSaveStatus('not logged in, so this score was not saved.')
        }

        setScreen('gameover')
      },
      logout: () => {
        localStorage.removeItem('allnourished-auth')
        setAuth({ token: '', user: null })
      },
    }),
    [auth.token, isLoggedIn]
  )

  async function handleLogin(mode, form) {
    setAuthError('')

    try {
      const response =
        mode === 'login'
          ? await loginUser(form.email, form.password)
          : await registerUser(form.username, form.email, form.password)

      const nextAuth = { token: response.token, user: response.user }
      localStorage.setItem('allnourished-auth', JSON.stringify(nextAuth))
      setAuth(nextAuth)
      await loadUserProgress(nextAuth.token)
      setScreen('start')
    } catch (error) {
      setAuthError(error.message)
    }
  }

  return (
    <div className="app-shell">
      {screen === 'start' && (
        <StartScreen
          username={username}
          isLoggedIn={isLoggedIn}
          authError={authError}
          onPlay={nav.startGame}
          onLeaderboard={nav.goLeaderboard}
          onTutorial={nav.goTutorial}
          onAchievements={nav.goAchievements}
          onLogin={nav.goLogin}
          onLogout={nav.logout}
        />
      )}

      {screen === 'tutorial' && <TutorialScreen onBack={nav.goStart} />}

      {screen === 'leaderboard' && (
        <LeaderboardScreen
          loading={leaderboardLoading}
          entries={leaderboard}
          onBack={nav.goStart}
        />
      )}

      {screen === 'achievements' && (
        <AchievementsScreen
          progress={userProgress}
          achievements={userAchievements}
          onBack={nav.goStart}
        />
      )}

      {screen === 'login' && (
        <LoginScreen
          error={authError}
          onBack={nav.goStart}
          onSubmit={handleLogin}
        />
      )}

      {screen === 'countdown' && <CountdownScreen onDone={nav.beginGameplay} />}

      {screen === 'game' && (
        <GameScreen
          username={username}
          onGameOver={nav.finishGame}
          userProgress={userProgress}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          result={gameResult}
          saveStatus={saveStatus}
          onPlayAgain={() => setScreen('countdown')}
          onLeaderboard={nav.goLeaderboard}
          onHome={nav.goStart}
        />
      )}
    </div>
  )
}