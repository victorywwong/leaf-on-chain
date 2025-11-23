import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Blockchain
  baseSepoliaRpcUrl: process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
  leafNFTAddress: process.env.LEAF_NFT_ADDRESS as `0x${string}`,
  paymentGatewayAddress: process.env.PAYMENT_GATEWAY_ADDRESS as `0x${string}`,

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
};

// Validate required environment variables
export function validateConfig() {
  const required = [
    'OPENAI_API_KEY',
    'LEAF_NFT_ADDRESS',
    'PAYMENT_GATEWAY_ADDRESS',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('   The server will start but some features may not work.');
    console.warn('   Please update your .env file.\n');
  }
}
