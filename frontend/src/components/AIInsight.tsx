interface AIInsightProps {
  insight: string;
}

function AIInsight({ insight }: AIInsightProps) {
  return (
    <div className="ai-insight">
      <h2>AI Insight</h2>
      <p>{insight}</p>
    </div>
  );
}

export default AIInsight;