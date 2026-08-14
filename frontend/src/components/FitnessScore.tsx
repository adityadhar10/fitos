function FitnessScore() {
  const score = 86;

  return (
    <div className="fitness-score">

      <div className="fitness-score-header">

        <h2>Fitness Score</h2>

        <p>Daily performance</p>

      </div>


      <div className="fitness-score-content">

        <div className="score-number">

          <strong>{score}</strong>

          <span>/ 100</span>

        </div>

      </div>

    </div>
  );
}

export default FitnessScore;