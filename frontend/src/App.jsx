import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [baseBranch, setBaseBranch] = useState('main');
  const [maxIterations, setMaxIterations] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [executionDetail, setExecutionDetail] = useState(null);

  const fetchExecutions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/executions`);
      const data = await res.json();
      if (data.executions) {
        setExecutions(data.executions);
      }
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    }
  }, []);

  const fetchExecutionDetail = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE}/executions/${id}`);
      const data = await res.json();
      setExecutionDetail(data);
    } catch (err) {
      console.error('Failed to fetch execution detail:', err);
    }
  }, []);

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 5000);
    return () => clearInterval(interval);
  }, [fetchExecutions]);

  useEffect(() => {
    if (selectedExecution) {
      fetchExecutionDetail(selectedExecution);
      const interval = setInterval(() => fetchExecutionDetail(selectedExecution), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedExecution, fetchExecutionDetail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, baseBranch, maxIterations }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start scan');

      setSelectedExecution(data.executionId);
      setRepoUrl('');
      fetchExecutions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await fetch(`${API_BASE}/executions/${id}/cancel`, { method: 'POST' });
      fetchExecutions();
      if (selectedExecution === id) fetchExecutionDetail(id);
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  const getStatusClass = (status) => {
    const map = {
      RUNNING: 'running',
      SUCCESS: 'success',
      FAILED: 'failed',
      CREATED: 'created',
      CANCELLED: 'cancelled',
      KILLING: 'cancelled',
    };
    return map[status] || 'created';
  };

  const getTaskIcon = (state) => {
    if (state === 'SUCCESS') return '✓';
    if (state === 'RUNNING') return '●';
    if (state === 'FAILED') return '✗';
    return '○';
  };

  return (
    <div className="container">
      <header>
        <div className="shield-icon">🛡️</div>
        <h1>Security AutoFix</h1>
      </header>

      <div className="card">
        <h2>Start New Scan</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Repository URL</label>
            <input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Base Branch</label>
              <input
                type="text"
                value={baseBranch}
                onChange={(e) => setBaseBranch(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Max Iterations</label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxIterations}
                onChange={(e) => setMaxIterations(Number(e.target.value))}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Starting...' : 'Start Security Scan'}
          </button>
        </form>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Recent Executions</h2>
          {executions.length === 0 ? (
            <div className="empty-state">No executions yet</div>
          ) : (
            <div className="executions-list">
              {executions.map((exec) => (
                <div
                  key={exec.id}
                  className={`execution-item ${selectedExecution === exec.id ? 'active' : ''}`}
                  onClick={() => setSelectedExecution(exec.id)}
                >
                  <div className="execution-info">
                    <span className="execution-id">{exec.id.slice(0, 8)}...</span>
                    <span className="execution-repo">{exec.inputs?.repo_url?.replace('https://github.com/', '')}</span>
                  </div>
                  <span className={`status-badge status-${getStatusClass(exec.status)}`}>
                    {exec.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Execution Details</h2>
          {!executionDetail ? (
            <div className="empty-state">Select an execution to view details</div>
          ) : (
            <div className="detail-panel">
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`status-badge status-${getStatusClass(executionDetail.status)}`}>
                  {executionDetail.status}
                </span>
                {executionDetail.status === 'RUNNING' && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleCancel(executionDetail.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
              <div className="tasks-list">
                {executionDetail.taskRunList?.map((task, i) => (
                  <div key={i} className="task-item">
                    <span className={`task-icon ${getStatusClass(task.state)}`}>
                      {getTaskIcon(task.state)}
                    </span>
                    <span>{task.taskId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
