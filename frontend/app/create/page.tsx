'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ThemeToggle } from '@/components/ThemeToggle';
import { leafNFTABI } from '@/lib/abis';
import { config } from '@/lib/config';

export default function CreateLeafPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [formData, setFormData] = useState({
    name: '',
    personalityNote: '',
    pricePerMessage: '0.001',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { writeContract, data: txHash, isPending, isError, error } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.name.length < 3 || formData.name.length > 50) {
      newErrors.name = 'Name must be 3-50 characters';
    }

    if (formData.personalityNote.length < 10 || formData.personalityNote.length > 500) {
      newErrors.personalityNote = 'Personality note must be 10-500 characters';
    }

    const price = parseFloat(formData.pricePerMessage);
    if (isNaN(price) || price < 0.0001) {
      newErrors.pricePerMessage = 'Price must be at least 0.0001 ETH';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      writeContract({
        address: config.contracts.leafNFT,
        abi: leafNFTABI,
        functionName: 'createLeafPublic',
        args: [
          formData.name,
          formData.personalityNote,
          parseEther(formData.pricePerMessage),
        ],
        value: parseEther('0.01'), // Creation fee
      });
    } catch (err) {
      console.error('Error creating leaf:', err);
    }
  };

  // Redirect on success
  useEffect(() => {
    if (isSuccess && txHash) {
      // Wait a moment before redirecting
      setTimeout(() => {
        router.push('/my-leaves');
      }, 2000);
    }
  }, [isSuccess, txHash, router]);

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Header */}
      <header className="bg-[color:var(--surface)]/90 backdrop-blur border-b border-[color:var(--surface-muted)]/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">🍃 Create Your Leaf</h1>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="leaf-card rounded-2xl p-8 text-center border border-[color:var(--surface-muted)]/60">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Connect your wallet to create your AI digital replica on-chain
            </p>
            <ConnectButton />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Form */}
            <div className="leaf-card rounded-2xl p-6 border border-[color:var(--surface-muted)]/60">
              <h2 className="text-2xl font-bold mb-6">Leaf Details</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    Leaf Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., AI Consultant Sarah"
                    className="w-full px-4 py-3 border border-[color:var(--surface-muted)] rounded-xl bg-[color:var(--surface-muted)] text-[color:var(--foreground)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-500/40"
                    maxLength={50}
                  />
                  {errors.name && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.name.length}/50 characters
                  </p>
                </div>

                {/* Personality Note */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    Personality Note *
                  </label>
                  <textarea
                    value={formData.personalityNote}
                    onChange={(e) => setFormData({ ...formData, personalityNote: e.target.value })}
                    placeholder="Describe your interests, expertise, communication style..."
                    className="w-full px-4 py-3 border border-[color:var(--surface-muted)] rounded-xl bg-[color:var(--surface-muted)] text-[color:var(--foreground)] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-500/40 min-h-[120px]"
                    maxLength={500}
                  />
                  {errors.personalityNote && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.personalityNote}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.personalityNote.length}/500 characters
                  </p>
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                    Price Per Message *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={formData.pricePerMessage}
                      onChange={(e) => setFormData({ ...formData, pricePerMessage: e.target.value })}
                      className="w-full px-4 py-3 border border-[color:var(--surface-muted)] rounded-xl bg-[color:var(--surface-muted)] text-[color:var(--foreground)] focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-500/40"
                    />
                    <span className="absolute right-4 top-3 text-slate-500">ETH</span>
                  </div>
                  {errors.pricePerMessage && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.pricePerMessage}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum: 0.0001 ETH (~$0.30)
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isPending || isTxLoading || isSuccess}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl hover:from-emerald-600 hover:to-sky-600 disabled:from-slate-400 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-700 disabled:cursor-not-allowed font-semibold transition-all shadow-md"
                >
                  {isPending || isTxLoading ? 'Creating...' : isSuccess ? 'Success!' : 'Create Leaf (0.01 ETH)'}
                </button>

                {/* Transaction Status */}
                {(isPending || isTxLoading) && txHash && (
                  <div className="text-sm text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                    <p className="mb-1 flex items-center gap-2">
                      ⏳ Transaction pending...
                    </p>
                    <a
                      href={`${config.blockExplorer.url}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      View on {config.blockExplorer.name} ↗
                    </a>
                  </div>
                )}

                {isError && (
                  <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="font-semibold mb-1">Transaction Failed</p>
                    <p className="text-xs">{error?.message || 'Unknown error'}</p>
                  </div>
                )}

                {isSuccess && (
                  <div className="text-sm text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    ✅ Leaf created successfully! Redirecting to home page...
                  </div>
                )}
              </form>
            </div>

            {/* Preview */}
            <div className="leaf-card rounded-2xl p-6 border border-[color:var(--surface-muted)]/60">
              <h2 className="text-2xl font-bold mb-6">Preview</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {formData.name || 'Your Leaf Name'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-2">
                    {formData.personalityNote || 'Your personality description will appear here...'}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="leaf-pill bg-transparent text-slate-900 border border-slate-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30 font-semibold">
                    💰 {formData.pricePerMessage || '0.001'} ETH/msg
                  </div>
                  <div className="leaf-pill bg-transparent text-slate-900 border border-slate-300 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-500/30 font-semibold">
                    💬 0 messages
                  </div>
                  <div className="leaf-pill bg-transparent text-slate-900 border border-slate-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30 font-semibold">
                    ✅ Active
                  </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-semibold mb-2 text-slate-900 dark:text-white">💡 How it works:</p>
                  <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                    <li>Pay 0.01 ETH creation fee (one-time)</li>
                    <li>Leaf minted as NFT to your wallet</li>
                    <li>Earn 70% from each message</li>
                    <li>Update personality & price anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-6 leaf-card rounded-2xl p-6 border border-[color:var(--surface-muted)]/60">
          <h3 className="font-semibold text-lg mb-3 text-slate-900 dark:text-white">What happens next?</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>Your wallet will prompt you to confirm the transaction (0.01 ETH + gas fees)</li>
            <li>Once confirmed, your Leaf NFT will be minted to your wallet</li>
            <li>Users can start chatting with your Leaf immediately</li>
            <li>You'll earn 70% of every message payment (30% goes to platform)</li>
            <li>You can update your Leaf's personality and pricing anytime</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
