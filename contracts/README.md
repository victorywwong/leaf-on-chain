# Leaf Smart Contracts

Solidity smart contracts for the Leaf platform - AI digital replicas that live on-chain.

## Contracts

- **LeafNFT.sol**: ERC-721 NFT representing individual leaves (AI replicas)
- **PaymentGateway.sol**: Handles pay-per-message payments (70% to owner, 30% to platform)

## Setup

1. Install Foundry (if not already installed):
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Install dependencies:
```bash
forge install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`:
   - `PRIVATE_KEY`: Your wallet private key (for deployment)
   - `TREASURY_ADDRESS`: Address to receive platform fees
   - `BASESCAN_API_KEY`: (Optional) For contract verification

## Development

### Compile
```bash
forge build
```

### Test
```bash
forge test
```

### Test with gas reporting
```bash
forge test --gas-report
```

### Test with verbosity
```bash
forge test -vvv
```

## Deployment

### Deploy to Base Sepolia Testnet

1. Get testnet ETH from Base Sepolia faucet:
   - https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Or bridge from Ethereum Sepolia

2. Deploy contracts:
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url base-sepolia --broadcast --verify
```

3. Save the deployment addresses (LeafNFT and PaymentGateway) for frontend use

### Deploy to Base Mainnet

```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url base --broadcast --verify
```

## Contract Architecture

### LeafNFT
- ERC-721 NFT with custom metadata
- Each leaf has: name, personalityNote, pricePerMessage, isActive status
- Owner can update personality and pricing
- Gateway can increment message count and set active status

### PaymentGateway
- Accepts payments for messages
- Splits revenue: 70% to leaf owner, 30% to treasury
- Emits events for backend processing
- Supports donations (100% to owner)

## Addresses (Base Sepolia)

After deployment, update this section with deployed addresses:

- LeafNFT: `<address>`
- PaymentGateway: `<address>`
- Demo Leaf ID: `1`

## Security

- Contracts use OpenZeppelin's audited implementations
- ReentrancyGuard on payment functions
- Access control via Ownable and custom gateway authorization
- All user funds go directly to leaf owners (no custody)

## Gas Optimization

- Compiler optimization enabled (200 runs)
- Minimal storage writes
- Events for off-chain indexing instead of expensive on-chain queries

## License

MIT
