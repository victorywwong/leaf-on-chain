import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import chatRouter from './routes/chat';

// Validate configuration
validateConfig();

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Leaf Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      chat: 'POST /api/chat',
      leafInfo: 'GET /api/chat/leaf/:leafId',
      health: 'GET /health',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/chat', chatRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Start server
const server = app.listen(config.port, () => {
  console.log('\n🍃 Leaf Backend API');
  console.log(`📡 Server running on http://localhost:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Base Sepolia RPC: ${config.baseSepoliaRpcUrl}`);
  console.log(`📝 LeafNFT Address: ${config.leafNFTAddress || 'Not set'}`);
  console.log(`💳 PaymentGateway Address: ${config.paymentGatewayAddress || 'Not set'}`);
  console.log(`🤖 OpenAI API Key: ${config.openaiApiKey ? '✓ Set' : '✗ Not set'}`);
  console.log('\n✨ Ready to serve!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
