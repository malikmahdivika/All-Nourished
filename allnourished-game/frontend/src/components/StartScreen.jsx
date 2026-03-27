export default function StartScreen({
  username,
  isLoggedIn,
  authError,
  onPlay,
  onLeaderboard,
  onTutorial,
  onAchievements,
  onLogin,
  onLogout,
}) {
  return (
    <div className="screen menu-screen">
      <div className="menu-card">
        <p className="eyebrow">allnourished</p>
        <h1>Zero Hunger Kitchen</h1>
        <p className="subtitle">
          Serve meals, restock ingredients, and survive the rush.
        </p>

        <div className="status-pill">
          {isLoggedIn ? `Logged in as ${username}` : 'Logged out.'}
        </div>
        {authError ? <p className="error-text">{authError}</p> : null}

        <div className="menu-buttons">
          <button onClick={onPlay}>Play</button>
          <button onClick={onLeaderboard}>Leaderboard</button>
          <button onClick={onTutorial}>Tutorial</button>
          <button onClick={onAchievements}>Achievements</button>
          <button onClick={onLogin}>{isLoggedIn ? 'Switch account' : 'Log in/Register'}</button>
          {isLoggedIn ? (
            <button className="secondary-button" onClick={onLogout}>Logout</button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
