import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const KESTRA_API = process.env.KESTRA_API_URL || 'http://localhost:8080';
const KESTRA_TOKEN = process.env.KESTRA_API_TOKEN;

const headers = {
  'Content-Type': 'application/json',
  ...(KESTRA_TOKEN && { Authorization: `Bearer ${KESTRA_TOKEN}` }),
};

// Trigger a new security scan execution
app.post('/api/scan', async (req, res) => {
  try {
    const { repoUrl, baseBranch = 'main', maxIterations = 8 } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'repoUrl is required' });
    }

    const response = await fetch(`${KESTRA_API}/api/v1/executions/security/security_autofix`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: {
          repo_url: repoUrl,
          base_branch: baseBranch,
          max_iterations: maxIterations,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    res.json({ executionId: data.id, status: data.state?.current || 'CREATED' });
  } catch (err) {
    console.error('Scan trigger error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get execution status
app.get('/api/executions/:id', async (req, res) => {
  try {
    const response = await fetch(`${KESTRA_API}/api/v1/executions/${req.params.id}`, { headers });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Execution not found' });
    }

    const data = await response.json();
    res.json({
      id: data.id,
      status: data.state?.current,
      startDate: data.state?.startDate,
      endDate: data.state?.endDate,
      duration: data.state?.duration,
      taskRunList: data.taskRunList?.map((t) => ({
        taskId: t.taskId,
        state: t.state?.current,
        startDate: t.state?.startDate,
        endDate: t.state?.endDate,
      })),
      outputs: data.outputs,
    });
  } catch (err) {
    console.error('Get execution error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List recent executions
app.get('/api/executions', async (req, res) => {
  try {
    const { page = 1, size = 20 } = req.query;
    const response = await fetch(
      `${KESTRA_API}/api/v1/executions?namespace=security&flowId=security_autofix&page=${page}&size=${size}`,
      { headers }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch executions' });
    }

    const data = await response.json();
    res.json({
      total: data.total,
      executions: data.results?.map((e) => ({
        id: e.id,
        status: e.state?.current,
        startDate: e.state?.startDate,
        inputs: e.inputs,
      })),
    });
  } catch (err) {
    console.error('List executions error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get execution logs
app.get('/api/executions/:id/logs', async (req, res) => {
  try {
    const response = await fetch(`${KESTRA_API}/api/v1/logs/${req.params.id}`, { headers });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Logs not found' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cancel execution
app.post('/api/executions/:id/cancel', async (req, res) => {
  try {
    const response = await fetch(`${KESTRA_API}/api/v1/executions/${req.params.id}/kill`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to cancel' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
