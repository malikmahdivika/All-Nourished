export default function AchievementsScreen({ progress = {}, achievements = [], onBack }) {
  return (
    <div className="screen info-screen">
      <div className="info-card">
        <h2>achievements</h2>

        <p>level: <strong>{progress.current_level || 1}</strong></p>
        <p>total meals served: <strong>{progress.total_meals_served || 0}</strong></p>
        <p>total survival time: <strong>{progress.total_survival_time || 0}s</strong></p>

        <ul className="achievement-list">
          {achievements.map((achievement) => (
            <li key={achievement.key} className={achievement.unlocked ? 'unlocked' : 'locked'}>
              <strong>{achievement.title}</strong> - {achievement.description}
              {achievement.unlocked ? (
                <span className="achievement-meta"> unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
              ) : (
                <span className="achievement-meta"> locked</span>
              )}
            </li>
          ))}
        </ul>

        <div className="menu-buttons compact-buttons">
          <button onClick={onBack}>back</button>
        </div>
      </div>
    </div>
  )
}
