export default function TutorialScreen({ onBack }) {
  return (
    <div className="screen info-screen">
      <div className="info-card">
        <h2>how to play</h2>
        <div className="tutorial-list">
          <p>1. customers line up across the top of the screen and each asks for a meal.</p>
          <p>2. click a plate at the bottom, then click the matching customer to serve them.</p>
          <p>3. keep an eye on the four ingredient supplies. click low ingredients to restock them.</p>
          <p>4. if ingredients run out, some meals can no longer appear until you refill them.</p>
          <p>5. if a customer waits too long, you lose a life. you only have 3 lives.</p>
          <p>6. the game gets faster over time, so balance serving and restocking carefully.</p>
          <p>7. at game over, your score is saved to the leaderboard if you are logged in.</p>
        </div>
        <button onClick={onBack}>back</button>
      </div>
    </div>
  )
}
