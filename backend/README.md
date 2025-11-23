# Leaf Backend API

Node.js + TypeScript backend for the Leaf platform.

## Features

- Payment verification using viem to read Base blockchain
- OpenAI GPT-4 chat integration
- RESTful API endpoints
- CORS enabled for frontend communication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `LEAF_NFT_ADDRESS`: Deployed LeafNFT contract address
   - `PAYMENT_GATEWAY_ADDRESS`: Deployed PaymentGateway contract address
   - `BASE_SEPOLIA_RPC_URL`: RPC URL for Base Sepolia (default provided)

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Run production build:
```bash
npm start
```

## API Endpoints

### GET /
Server info and available endpoints

### GET /health
Health check endpoint

### POST /api/chat
Chat with a leaf (requires payment verification)

**Request body:**
```json
{
  "leafId": 1,
  "message": "What do you think about AI?",
  "txHash": "0x...",
  "userAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leafId": 1,
    "leafName": "Demo Leaf",
    "message": "AI response here...",
    "timestamp": "2025-11-23T..."
  }
}
```

### GET /api/chat/leaf/:leafId
Get leaf information

**Response:**
```json
{
  "success": true,
  "data": {
    "leafId": "1",
    "name": "Demo Leaf",
    "personalityNote": "I love crypto and AI...",
    "pricePerMessage": "1000000000000000",
    "isActive": true,
    "totalMessages": "0",
    "createdAt": "2025-11-23T..."
  }
}
```

## Architecture

- `src/index.ts` - Express server setup
- `src/config.ts` - Environment configuration
- `src/blockchain.ts` - Blockchain interaction (viem)
- `src/routes/chat.ts` - Chat endpoints

## Payment Verification Flow

1. User sends payment transaction on Base blockchain
2. Frontend gets transaction hash
3. Backend verifies transaction:
   - Checks transaction status
   - Verifies it's to PaymentGateway contract
   - Parses MessagePaid event logs
   - Validates leafId and userAddress match
4. If valid, processes chat request with OpenAI

## Error Handling

- 400: Bad request (missing parameters)
- 403: Payment verification failed or leaf hibernating
- 404: Leaf not found
- 500: Internal server error

## Security

- Payment verification prevents unauthorized access
- CORS configured for specific origins
- No sensitive data logged in production
- OpenAI API key stored in environment variables
