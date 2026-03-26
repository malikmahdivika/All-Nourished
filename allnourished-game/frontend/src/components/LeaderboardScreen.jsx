export default function LeaderboardScreen({ entries, loading, onBack }) {
  return (
    <div className="screen info-screen">
      <div className="info-card wide-card">
        <h2>leaderboard</h2>
        {loading ? <p>loading scores...</p> : null}
        {!loading && entries.length === 0 ? <p>No scores yet.</p> : null}
        {!loading && entries.length > 0 ? (
          <div className="leaderboard-table">
            <div className="leaderboard-row leaderboard-head">
              <span>Rank</span>
              <span>Player</span>
              <span>Score</span>
              <span>Time</span>
            </div>
            {entries.map((entry, index) => (
              <div className="leaderboard-row" key={entry.id || `${entry.username}-${index}`}>
                <span>#{index + 1}</span>
                <span>{entry.username}</span>
                <span>{entry.score}</span>
                <span>{entry.survival_time}s</span>
              </div>
            ))}
          </div>
        ) : null}
        <button onClick={onBack}>Back</button>
      </div>
    </div>
  )
}
