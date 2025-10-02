const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const promClient = require('prom-client');
const winston = require('winston');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sit753-app' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Prometheus metrics setup
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({
  app: 'sit753-app',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register
});

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration / 1000);
  });
  
  next();
});

// Static files
app.use(express.static(path.join(__dirname, '.')));

// API Routes
app.get('/api/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV,
    status: 'healthy'
  };
  
  logger.info('Health check requested', healthCheck);
  res.status(200).json(healthCheck);
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'SIT753 DevOps Pipeline Application',
    version: '1.0.0',
    description: 'High Distinction Jenkins Pipeline Implementation',
    author: 'Your Name',
    buildNumber: process.env.BUILD_NUMBER || 'local',
    gitCommit: process.env.GIT_COMMIT || 'unknown'
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple authentication logic for testing
  if (username && password) {
    if (username === 'admin' && password === 'admin') {
      res.json({
        success: true,
        message: 'Login successful',
        token: 'fake-jwt-token',
        user: { username, role: 'admin' }
      });
    } else if (username === 'test' && password === 'test') {
      res.json({
        success: true,
        message: 'Login successful',
        token: 'fake-jwt-token',
        user: { username, role: 'user' }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } else {
    res.status(400).json({
      success: false,
      message: 'Username and password required'
    });
  }
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, username: 'admin', role: 'admin' },
    { id: 2, username: 'user1', role: 'user' },
    { id: 3, username: 'user2', role: 'user' }
  ]);
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Main routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'support.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Server startup with proper error handling
const startServer = () => {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Server running on port ${PORT} in ${NODE_ENV} mode`);
      logger.info(`✅ Health endpoint: http://0.0.0.0:${PORT}/api/health`);
      resolve(server);
    }).on('error', (err) => {
      logger.error(`❌ Server failed to start: ${err.message}`);
      if (err.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
      }
      reject(err);
    });
  });
};

// Graceful shutdown
const gracefulShutdown = (server) => {
  return () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
};

// Start server only if this file is run directly
if (require.main === module) {
  startServer()
    .then(server => {
      process.on('SIGTERM', gracefulShutdown(server));
      process.on('SIGINT', gracefulShutdown(server));
    })
    .catch(err => {
      logger.error('Failed to start server:', err);
      process.exit(1);
    });
}

// Export for testing
module.exports = { app, startServer };
