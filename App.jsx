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
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userContext: {
            currentSkills: formData.skills.split(',').map(s => s.trim()),
            experienceLevel: 'beginner',
            goals: [formData.goal],
            preferredLearningStyle: 'mixed',
            timeCommitment: parseInt(formData.timePerWeek)
          },
          targetSkills: [formData.goal]
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate roadmap');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Smart Developer Roadmap Generator 🚀</h1>
        <p>Generate your personalized learning path</p>
      </header>

      <main>
        {/* FORM */}
        <section className="form-section">
          <h2>Generate Roadmap</h2>

          <form onSubmit={handleSubmit} className="roadmap-form">
            <input
              type="text"
              name="skills"
              placeholder="Enter skills (e.g., html-basics)"
              value={formData.skills}
              onChange={handleInputChange}
              required
            />

            <select
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
            >
              <option value="fullstack">Fullstack</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
            </select>

            <input
              type="number"
              name="timePerWeek"
              value={formData.timePerWeek}
              onChange={handleInputChange}
            />

            <button type="submit">
              {loading ? "Generating..." : "Generate Roadmap"}
            </button>
          </form>
        </section>

        {/* ERROR */}
        {error && (
          <div className="card">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <>
            {/* SUMMARY */}
            <div className="card">
              <h3>Summary</h3>
              <p><strong>Path:</strong> {result.title}</p>
              <p><strong>Total Hours:</strong> {result.totalHours}</p>
              <p><strong>Milestones:</strong> {result.milestones?.length}</p>
            </div>

            {/* STEPS */}
            <div className="card">
              <h3>Learning Steps</h3>

              {(result.steps || []).map((step, index) => (
                <div key={step.skill.id}>
                  <h4>{index + 1}. {step.skill.name}</h4>
                  <p>{step.skill.description}</p>
                  <p>⏱ {step.estimatedHours} hours</p>
                </div>
              ))}
            </div>

            {/* MILESTONES */}
            <div className="card">
              <h3>Milestones</h3>

              {(result.milestones || []).map((m, i) => (
                <div key={m.id}>
                  <h4>{i + 1}. {m.title}</h4>
                  <p>{m.description}</p>
                </div>
              ))}
            </div>

            {/* SKILL GAPS */}
            <div className="card">
              <h3>Skill Gaps</h3>

              {(result.gaps || []).map((g, i) => (
                <div key={g.skillId}>
                  <h4>{g.skill.name}</h4>
                  <p>{g.reason}</p>
                </div>
              ))}
            </div>

            {/* EXPLANATION */}
            <div className="card">
              <h3>Why This Roadmap?</h3>
              <p>{result.summary}</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;