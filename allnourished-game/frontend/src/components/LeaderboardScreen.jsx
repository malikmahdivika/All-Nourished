export default function LeaderboardScreen({ entries, loading, onBack }) {
  return (
    <div className="screen info-screen">
      <div className="info-card wide-card">
        <h2>leaderboard</h2>
        {loading ? <p>loading scores...</p> : null}
        {!loading && entries.length === 0 ? <p>no scores yet.</p> : null}
        {!loading && entries.length > 0 ? (
          <div className="leaderboard-table">
            <div className="leaderboard-row leaderboard-head">
              <span>rank</span>
              <span>player</span>
              <span>score</span>
              <span>time</span>
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
        <button onClick={onBack}>back</button>
      </div>
    </div>
  )
}
