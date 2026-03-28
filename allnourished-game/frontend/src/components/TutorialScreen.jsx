export default function TutorialScreen({ onBack }) {
  return (
    <div className="screen info-screen">
      <div className="info-card">
        <h2>How to Play</h2>
        <div className="tutorial-list">
          <p>1. The customers line up across the top of the screen and each asks for a meal.</p>
          <p>2. Choose a plate at the bottom, then click the matching customer to serve them.</p>
          <p>3. Keep an eye on the ingredient supplies. Click low ingredients to restock them.</p>
          <p>4. If ingredients run out, some meals can no longer appear until you refill them.</p>
          <p>5. If a customer waits too long, you lose a life. you only have 3 lives.</p>
          <p>6. The game gets faster over time, so balance serving and restocking carefully.</p>
          <p>7. As you progress, you will level up and unlock new ingredients.</p>
          <p>8. On game over, your score is saved to the leaderboard if you are logged in.</p>
        </div>
        <button onClick={onBack}>back</button>
      </div>
    </div>
  )
}
