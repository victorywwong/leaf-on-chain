'use client';

import { use, useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { config } from '@/lib/config';
import { paymentGatewayABI } from '@/lib/abis';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors">
      {/* Header */}
      <header className="bg-[color:var(--surface)]/90 backdrop-blur border-b border-[color:var(--surface-muted)]/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">🍃 Leaf</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">AI Digital Replica</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          {/* Leaf Info Card */}
        <div className="leaf-card rounded-2xl p-6 border border-[color:var(--surface-muted)]/60">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{leaf.name}</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">{leaf.personalityNote}</p>
              <div className="flex gap-3 text-sm flex-wrap">
                <div className="leaf-pill bg-transparent text-slate-900 border border-slate-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30 font-semibold">
                  💰 {leaf?.pricePerMessage ? formatEther(leaf.pricePerMessage) : '0.001'} ETH/msg
                </div>
                <div className="leaf-pill bg-transparent text-slate-900 border border-slate-300 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-500/30 font-semibold">
                  💬 {leaf?.totalMessages?.toString() || '0'} messages
                </div>
                <div
                  className={`leaf-pill border font-semibold ${
                    leaf.isActive
                      ? 'bg-transparent text-slate-900 border-slate-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30'
                      : 'bg-transparent text-slate-900 border-slate-300 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/30'
                  }`}
                >
                  {leaf.isActive ? '✅ Active' : '💤 Hibernating'}
                </div>
              </div>
            </div>
          </div>
          {!leaf.isActive && (
            <p className="mt-4 text-sm text-rose-600 dark:text-rose-300 font-medium">
              This leaf is hibernating until its wallet balance is topped up.
            </p>
          )}
        </div>

        {/* Chat Interface */}
        <div className="leaf-card rounded-2xl overflow-hidden border border-[color:var(--surface-muted)]/60">
          {/* Messages */}
          <div className="chat-messages-area h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center mt-20">
                <div className="inline-block bg-[color:var(--surface)] rounded-2xl px-8 py-6 shadow-sm border border-[color:var(--surface-muted)]">
                  <p className="text-lg mb-2 text-[color:var(--foreground)] font-semibold">Start a conversation!</p>
                  <p className="text-sm opacity-70">Connect your wallet and send a message to chat with this leaf.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[72%] rounded-2xl p-4 transition-all duration-200 shadow-sm ${
                      msg.role === 'user' ? 'leaf-bubble-user' : 'leaf-bubble-ai'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-[0.65rem] mt-2 tracking-wide uppercase ${
                        msg.role === 'user' ? 'text-emerald-50/80' : 'text-slate-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isSending && (
              <div className="flex justify-start">
                <div className="leaf-bubble-ai rounded-2xl p-4 animate-pulse">
                  <p className="text-slate-600 dark:text-slate-200">Thinking...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[color:var(--surface-muted)] bg-[color:var(--surface)]/90 p-4">
            {!isConnected ? (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-slate-300 mb-4">Connect your wallet to start chatting</p>
                <ConnectButton />
              </div>
            ) : !leaf.isActive ? (
              <div className="text-center py-4 text-red-600 dark:text-red-400">
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
                    className="flex-1 px-4 py-3 border border-[color:var(--surface-muted)] rounded-xl bg-[color:var(--surface-muted)] text-[color:var(--foreground)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-500/40 transition-colors"
                    disabled={isSending || isPaymentPending || isTxLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isSending || isPaymentPending || isTxLoading}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl hover:from-emerald-600 hover:to-sky-600 disabled:bg-gradient-to-r disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed font-semibold transition-all shadow-md"
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
                      className="px-4 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-medium transition-colors"
                      title="Cancel and reset"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </>
            )}
            {(isPaymentPending || isTxLoading) && (
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 flex items-center gap-2">
                ⏳ Waiting for payment confirmation on Base...
              </p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-2 bg-[color:var(--surface)]/80 border border-[color:var(--surface-muted)] rounded-2xl p-5 text-sm text-slate-700 dark:text-slate-300 leaf-card">
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
