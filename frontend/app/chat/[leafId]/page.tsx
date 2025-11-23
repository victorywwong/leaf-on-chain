'use client';

import { use, useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { config } from '@/lib/config';
import { paymentGatewayABI } from '@/lib/abis';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatPage({ params }: { params: Promise<{ leafId: string }> }) {
  const { leafId } = use(params);
  const { address, isConnected } = useAccount();

  // State
  const [leaf, setLeaf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | null>(null);

  // Payment contract write
  const {
    data: txHash,
    writeContract,
    isPending: isPaymentPending,
    isError: isPaymentError,
    error: paymentError,
    reset: resetPayment
  } = useWriteContract();

  // Wait for transaction confirmation
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch leaf data from backend API
  const fetchLeafData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/chat/leaf/${leafId}`);
      const data = await response.json();

      if (data.success) {
        console.log('Leaf data from backend:', data.data);
        setLeaf({
          name: data.data.name,
          personalityNote: data.data.personalityNote,
          pricePerMessage: BigInt(data.data.pricePerMessage),
          isActive: data.data.isActive,
          createdAt: BigInt(new Date(data.data.createdAt).getTime()),
          totalMessages: BigInt(data.data.totalMessages),
        });
      }
    } catch (error) {
      console.error('Error fetching leaf data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeafData();
  }, [leafId]);

  // Reset transaction state
  const handleReset = () => {
    setIsSending(false);
    resetPayment();
    console.log('Transaction state reset');
  };

  // Handle payment and send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !address || !leaf) return;

    try {
      setIsSending(true);

      // Step 1: Send payment transaction
      console.log('Sending payment transaction...');
      writeContract({
        address: config.contracts.paymentGateway,
        abi: paymentGatewayABI,
        functionName: 'payForMessage',
        args: [BigInt(leafId)],
        value: leaf.pricePerMessage,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send payment. Please try again.');
      setIsSending(false);
    }
  };

  // Handle payment errors (rejected, canceled, failed)
  useEffect(() => {
    if (isPaymentError) {
      console.error('Payment error:', paymentError);
      setIsSending(false);
      resetPayment();
      alert('Transaction was rejected or failed. Please try again.');
    }
  }, [isPaymentError, paymentError]);

  // When transaction is confirmed, send message to backend
  useEffect(() => {
    if (isTxSuccess && txHash && inputMessage && address) {
      sendMessageToBackend(txHash, inputMessage, address);
    }
  }, [isTxSuccess, txHash]);

  const sendMessageToBackend = async (
    txHash: `0x${string}`,
    message: string,
    userAddress: string
  ) => {
    try {
      // Add user message to chat
      const userMsg: Message = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputMessage('');

      // Call backend API with conversation history
      const response = await fetch(`${config.apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leafId: leafId,
          message: message,
          conversationHistory: messages, // Send full conversation history
          txHash: txHash,
          userAddress: userAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Backend request failed');
      }

      const data = await response.json();

      // Add AI response to chat
      const aiMsg: Message = {
        role: 'assistant',
        content: data.data.message,
        timestamp: data.data.timestamp,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Refetch leaf data to update message count
      await fetchLeafData();
    } catch (error) {
      console.error('Error calling backend:', error);
      alert('Failed to get AI response. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading leaf data...</div>
      </div>
    );
  }

  if (!leaf) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Leaf not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600">🍃 Leaf</h1>
            <p className="text-sm text-gray-600">AI Digital Replica</p>
          </div>
          <ConnectButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Leaf Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{leaf.name}</h2>
              <p className="text-gray-600 mb-4">{leaf.personalityNote}</p>
              <div className="flex gap-4 text-sm">
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  💰 {leaf?.pricePerMessage ? formatEther(leaf.pricePerMessage) : '0.001'} ETH per message
                </div>
                <div className="bg-blue-100 px-3 py-1 rounded-full">
                  💬 {leaf?.totalMessages?.toString() || '0'} messages
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  leaf.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {leaf.isActive ? '✅ Active' : '💤 Hibernating'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                <p className="text-lg mb-2">Start a conversation!</p>
                <p className="text-sm">Connect your wallet and send a message to chat with this leaf.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-600">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            {!isConnected ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">Connect your wallet to start chatting</p>
                <ConnectButton />
              </div>
            ) : !leaf.isActive ? (
              <div className="text-center py-4 text-red-600">
                This leaf is currently hibernating and cannot respond.
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isSending || isPaymentPending || isTxLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isSending || isPaymentPending || isTxLoading}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {isPaymentPending || isTxLoading
                      ? 'Paying...'
                      : isSending
                      ? 'Sending...'
                      : 'Send'}
                  </button>
                  {(isSending || isPaymentPending || isTxLoading) && (
                    <button
                      onClick={handleReset}
                      className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                      title="Cancel and reset"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </>
            )}
            {(isPaymentPending || isTxLoading) && (
              <p className="text-sm text-gray-600 mt-2">
                ⏳ Waiting for payment confirmation on Base...
              </p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">💡 How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Connect your wallet (needs Base Sepolia ETH)</li>
            <li>Type a message and click "Send"</li>
            <li>Pay {leaf?.pricePerMessage ? formatEther(leaf.pricePerMessage) : '0.001'} ETH per message</li>
            <li>Wait for the AI to respond (powered by GPT-4)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
