import React, { useState } from 'react';

function App() {
  const [formData, setFormData] = useState({
    skills: '',
    goal: 'fullstack',
    timePerWeek: '10'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/generate-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate roadmap');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Smart Developer Roadmap Generator</h1>
        <p>Create your personalized learning path using deterministic skill analysis</p>
      </header>

      <main>
        <section className="form-section">
          <h2>Generate Your Roadmap</h2>
          <form onSubmit={handleSubmit} className="roadmap-form">
            <div className="form-group">
              <label htmlFor="skills">Current Skills (comma separated)</label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g., html-basics, css-basics"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="goal">Learning Goal</label>
              <select
                id="goal"
                name="goal"
                value={formData.goal}
                onChange={handleInputChange}
                required
              >
                <option value="fullstack">Full Stack Development</option>
                <option value="frontend">Frontend Development</option>
                <option value="backend">Backend Development</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timePerWeek">Hours per week</label>
              <input
                type="number"
                id="timePerWeek"
                name="timePerWeek"
                value={formData.timePerWeek}
                onChange={handleInputChange}
                min="1"
                max="40"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Generating...' : 'Generate Roadmap'}
            </button>
          </form>
        </section>

        {error && (
          <section className="error-section">
            <div className="error-message">
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          </section>
        )}

        {result && (
          <section className="results-section">
            <h2>Your Learning Roadmap</h2>
            
            {/* Summary */}
            <div className="card">
              <h3>Summary</h3>
              <div className="summary-content">
                <p><strong>Path:</strong> {result.roadmap.title}</p>
                <p><strong>Total Skills:</strong> {result.roadmap.skills.length}</p>
                <p><strong>Estimated Time:</strong> {result.roadmap.totalEstimatedHours} hours</p>
                <p><strong>Milestones:</strong> {result.milestones.length}</p>
              </div>
            </div>

            {/* Learning Steps */}
            <div className="card">
              <h3>Learning Steps</h3>
              <div className="steps-list">
                {result.roadmap.skills
                  .filter(step => step.status === 'pending')
                  .map((step, index) => (
                    <div key={step.skill.id} className="step-item">
                      <div className="step-header">
                        <h4>{index + 1}. {step.skill.name}</h4>
                        <span className={`difficulty ${step.skill.difficulty}`}>
                          {step.skill.difficulty}
                        </span>
                      </div>
                      <p className="step-description">{step.skill.description}</p>
                      <div className="step-details">
                        <span className="hours">⏱️ {step.estimatedHours} hours</span>
                        <span className="resources">📚 {step.resources.length} resources</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Milestones */}
            <div className="card">
              <h3>Milestones</h3>
              <div className="milestones-list">
                {result.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="milestone-item">
                    <h4>{index + 1}. {milestone.title}</h4>
                    <p>{milestone.description}</p>
                    <div className="milestone-details">
                      <span className="required-skills">
                        📋 {milestone.requiredSkills.length} skills required
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="card">
              <h3>Skill Gaps</h3>
              <div className="gaps-list">
                {result.skillGaps.slice(0, 5).map((gap) => (
                  <div key={gap.skillId} className="gap-item">
                    <div className="gap-header">
                      <h4>{gap.skill.name}</h4>
                      <span className={`priority ${gap.priority}`}>
                        {gap.priority} priority
                      </span>
                    </div>
                    <p><strong>Type:</strong> {gap.gapType}</p>
                    <p><strong>Reason:</strong> {gap.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="card">
              <h3>Why This Roadmap?</h3>
              <div className="explanation-content">
                <div className="explanation-text">
                  {result.summary.split('\n').map((paragraph, index) => (
                    paragraph.trim() && <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>
        <p>Powered by deterministic skill analysis algorithms</p>
      </footer>
    </div>
  );
}

export default App;
