import express from 'express';
import cors from 'cors';
import { parseMortgages } from './lib';
import { ParseRequest, ParseResponse } from './types';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/parse', async (req, res) => {
  const body = req.body as ParseRequest;
  
  if (!body.banks || !Array.isArray(body.banks) || body.banks.length === 0) {
    return res.status(400).json({ error: 'banks array is required' });
  }
  
  if (!body.region || typeof body.region !== 'string') {
    return res.status(400).json({ error: 'region is required' });
  }
  
  for (const bank of body.banks) {
    if (!bank.domain || !bank.url) {
      return res.status(400).json({ error: 'Each bank must have domain and url' });
    }
  }
  
  try {
    const results = await parseMortgages(body.banks, body.region);
    res.json({ results } as ParseResponse);
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`[INFO] Mortgage parser server running on http://localhost:${port}`);
});

export default app;
