export default function GameOverScreen({ result, saveStatus, onPlayAgain, onLeaderboard, onHome }) {
  const isError = saveStatus?.toLowerCase().includes('could not')

  return (
    <div className="screen info-screen">
      <div className="info-card">
        <h2>game over</h2>
        <p>final score: <strong>{result?.score ?? 0}</strong></p>
        <p>time survived: <strong>{result?.timeSurvived ?? 0}s</strong></p>

        {saveStatus ? (
          <p className={isError ? 'error-text' : 'success-text'}>
            {saveStatus}
          </p>
        ) : null}

        <div className="menu-buttons compact-buttons">
          <button onClick={onPlayAgain}>play again</button>
          <button onClick={onLeaderboard}>leaderboard</button>
          <button onClick={onHome}>home</button>
        </div>
      </div>
    </div>
  )
}