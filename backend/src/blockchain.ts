import { createPublicClient, http, getContract, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { config } from './config';

// ABI fragments for the contracts
const LEAF_NFT_ABI = [
  {
    inputs: [{ name: 'leafId', type: 'uint256' }],
    name: 'getLeaf',
    outputs: [
      {
        components: [
          { name: 'name', type: 'string' },
          { name: 'personalityNote', type: 'string' },
          { name: 'pricePerMessage', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'totalMessages', type: 'uint256' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'leafId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalLeaves',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const PAYMENT_GATEWAY_ABI = [
  {
    inputs: [
      { indexed: true, name: 'leafId', type: 'uint256' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: true, name: 'leafOwner', type: 'address' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'platformFee', type: 'uint256' },
      { name: 'ownerAmount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
    ],
    name: 'MessagePaid',
    type: 'event',
  },
] as const;

// Create public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(config.baseSepoliaRpcUrl),
});

// Contract instances
export const leafNFTContract = getContract({
  address: config.leafNFTAddress,
  abi: LEAF_NFT_ABI,
  client: publicClient,
});

// Types
export interface Leaf {
  name: string;
  personalityNote: string;
  pricePerMessage: bigint;
  isActive: boolean;
  createdAt: bigint;
  totalMessages: bigint;
}

/**
 * Get leaf data from blockchain
 */
export async function getLeafData(leafId: number): Promise<Leaf | null> {
  try {
    const leaf = await leafNFTContract.read.getLeaf([BigInt(leafId)]);
    return {
      name: leaf.name,
      personalityNote: leaf.personalityNote,
      pricePerMessage: leaf.pricePerMessage,
      isActive: leaf.isActive,
      createdAt: leaf.createdAt,
      totalMessages: leaf.totalMessages,
    };
  } catch (error) {
    console.error('Error fetching leaf data:', error);
    return null;
  }
}

/**
 * Get leaf owner address
 */
export async function getLeafOwner(leafId: number): Promise<string | null> {
  try {
    const owner = await leafNFTContract.read.ownerOf([BigInt(leafId)]);
    return owner;
  } catch (error) {
    console.error('Error fetching leaf owner:', error);
    return null;
  }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(
  txHash: string,
  leafId: number,
  userAddress: string
): Promise<boolean> {
  try {
    // Get transaction receipt
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt || receipt.status !== 'success') {
      return false;
    }

    // Check if the transaction is to the PaymentGateway contract
    if (receipt.to?.toLowerCase() !== config.paymentGatewayAddress.toLowerCase()) {
      return false;
    }

    // Parse logs to find MessagePaid event
    const messagePaidEvent = receipt.logs.find((log) => {
      // Check if this is a MessagePaid event (topic0 matches event signature)
      return (
        log.address.toLowerCase() === config.paymentGatewayAddress.toLowerCase() &&
        log.topics.length >= 3
      );
    });

    if (!messagePaidEvent) {
      return false;
    }

    // Decode the event topics
    // topics[1] = leafId, topics[2] = user address
    const eventLeafId = parseInt(messagePaidEvent.topics[1] || '0x0', 16);
    const eventUserAddress = `0x${messagePaidEvent.topics[2]?.slice(26)}`;

    // Verify leafId and user address match
    return (
      eventLeafId === leafId &&
      eventUserAddress.toLowerCase() === userAddress.toLowerCase()
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

/**
 * Get total number of leaves
 */
export async function getTotalLeaves(): Promise<number> {
  try {
    const total = await leafNFTContract.read.totalLeaves();
    return Number(total);
  } catch (error) {
    console.error('Error fetching total leaves:', error);
    return 0;
  }
}
