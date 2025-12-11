console.log('Starting server...');

try {
  const express = require('express');
  console.log('✓ Express loaded');
  
  const cors = require('cors');
  console.log('✓ CORS loaded');
  
  const helmet = require('helmet');
  console.log('✓ Helmet loaded');
  
  const config = require('./config');
  console.log('✓ Config loaded:', config.server);
  
  const logger = require('./utils/logger');
  console.log('✓ Logger loaded');
  
  const routes = require('./routes');
  console.log('✓ Routes loaded');
  
  const app = express();
  console.log('✓ App created');
  
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  console.log('✓ Middleware configured');
  
  app.use('/api', routes);
  console.log('✓ API routes mounted');
  
  app.get('/', (req, res) => {
    console.log('Root route hit!');
    res.json({ name: 'Test', status: 'running' });
  });
  console.log('✓ Root route configured');
  
  const server = app.listen(config.server.port, config.server.host, () => {
    console.log(`✓ Server listening on ${config.server.host}:${config.server.port}`);
  });
  
} catch (error) {
  console.error('✗ Error:', error.message);
  console.error(error.stack);
}
