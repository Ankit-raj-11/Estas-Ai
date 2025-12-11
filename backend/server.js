const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const logger = require('./utils/logger');
const routes = require('./routes');
const { AppError } = require('./utils/errors');

/**
 * Initialize Express application
 */
const app = express();

/**
 * Security middleware
 */
app.use(helmet());
app.use(cors());

/**
 * Rate limiting
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging middleware
 */
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

/**
 * Mount API routes
 */
app.use('/api', routes);

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Automated Security Scanner API',
    version: '1.0.0',
    status: 'running'
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  // Log error
  logger.error(`Error: ${err.message}`, {
    error: err,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Send error response
  res.status(statusCode).json({
    error: err.name || 'Error',
    message: err.message || 'Internal server error',
    details: err.details || null,
    ...(config.server.env === 'development' && { stack: err.stack })
  });

  // If error is not operational, it might be a programming error
  if (!isOperational) {
    logger.error('Non-operational error detected - this might be a bug', { err });
  }
});

/**
 * Start server
 */
let server;

function startServer() {
  server = app.listen(config.server.port, config.server.host, () => {
    logger.info(`Server started on ${config.server.host}:${config.server.port}`, {
      env: config.server.env,
      nodeVersion: process.version
    });
  });

  return server;
}

/**
 * Graceful shutdown
 */
function gracefulShutdown(signal) {
  logger.info(`${signal} received, starting graceful shutdown`);
  
  if (server) {
    server.close(() => {
      logger.info('Server closed, exiting process');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err, stack: err.stack });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

// Start server if not in test mode
if (require.main === module) {
  startServer();
}

module.exports = app;
