export default function AchievementsScreen({ progress = {}, achievements = [], onBack }) {
  return (
    <div className="screen info-screen">
      <div className="info-card">
        <h2>Achievements</h2>

        <div className="achievements-container">
          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-icon">📊</span>
              <span className="stat-label">level</span>
              <span className="stat-value">{progress.current_level == 5 ? '5 (MAX)' : progress.current_level || 1}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🍽️</span>
              <span className="stat-label">meals served</span>
              <span className="stat-value">{progress.total_meals_served || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⏱️</span>
              <span className="stat-label">survival time</span>
              <span className="stat-value">{progress.total_survival_time || 0}s</span>
            </div>
          </div>

          <div className="achievement-grid">
            {achievements.map((achievement) => (
              <div key={achievement.key} className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                <div className="achievement-content">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  {achievement.unlocked ? (
                    <span className="achievement-status">✓ Unlocked</span>
                  ) : (
                    <span className="achievement-status locked-status">🔒 Locked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="menu-buttons compact-buttons">
          <button onClick={onBack}>back</button>
        </div>
      </div>
    </div>
  )
}
