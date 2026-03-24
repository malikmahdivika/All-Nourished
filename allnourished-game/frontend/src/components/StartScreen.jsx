export default function StartScreen({
  username,
  isLoggedIn,
  authError,
  onPlay,
  onLeaderboard,
  onTutorial,
  onLogin,
  onLogout,
}) {
  return (
    <div className="screen menu-screen">
      <div className="menu-card">
        <p className="eyebrow">allnourished</p>
        <h1>zero hunger kitchen</h1>
        <p className="subtitle">
          serve meals, restock ingredients, and survive the rush.
        </p>

        <div className="status-pill">
          {isLoggedIn ? `logged in as ${username}` : 'not logged in'}
        </div>
        {authError ? <p className="error-text">{authError}</p> : null}

        <div className="menu-buttons">
          <button onClick={onPlay}>play</button>
          <button onClick={onLeaderboard}>leaderboard</button>
          <button onClick={onTutorial}>tutorial</button>
          <button onClick={onLogin}>{isLoggedIn ? 'switch account' : 'log in'}</button>
          {isLoggedIn ? (
            <button className="secondary-button" onClick={onLogout}>logout</button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
