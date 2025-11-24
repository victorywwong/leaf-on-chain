'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ThemeToggle } from '@/components/ThemeToggle';
import { formatEther } from 'viem';
import Link from 'next/link';
import { config } from '@/lib/config';
import { leafNFTABI } from '@/lib/abis';
import { readContract } from '@wagmi/core';
import { config as wagmiConfig } from '@/lib/wagmi';

interface LeafData {
  id: number;
  name: string;
  personalityNote: string;
  pricePerMessage: bigint;
  isActive: boolean;
  totalMessages: bigint;
}

export default function MyLeavesPage() {
  const { address, isConnected } = useAccount();
  const [leaves, setLeaves] = useState<LeafData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyLeaves = async () => {
    if (!address) return;

    try {
      setLoading(true);

      // First, get total number of leaves
      const totalLeaves = await readContract(wagmiConfig, {
        address: config.contracts.leafNFT,
        abi: leafNFTABI,
        functionName: 'totalLeaves',
      }) as bigint;

      console.log('Total leaves:', totalLeaves.toString());

      // Then check ownership for each leaf
      const myLeaves: LeafData[] = [];
      for (let i = 1; i <= Number(totalLeaves); i++) {
        try {
          // Check if this wallet owns this leaf
          const owner = await readContract(wagmiConfig, {
            address: config.contracts.leafNFT,
            abi: leafNFTABI,
            functionName: 'ownerOf',
            args: [BigInt(i)],
          }) as string;

          if (owner.toLowerCase() === address.toLowerCase()) {
            // Fetch leaf data
            const leafData = await readContract(wagmiConfig, {
              address: config.contracts.leafNFT,
              abi: leafNFTABI,
              functionName: 'getLeaf',
              args: [BigInt(i)],
            }) as any;

            console.log('Leaf data for ID', i, ':', leafData);

            // Handle both array and object responses
            const name = leafData.name || leafData[0] || '';
            const personalityNote = leafData.personalityNote || leafData[1] || '';
            const pricePerMessage = leafData.pricePerMessage || leafData[2] || BigInt(0);
            const isActive = leafData.isActive !== undefined ? leafData.isActive : leafData[3];
            const totalMessages = leafData.totalMessages || leafData[5] || BigInt(0);

            myLeaves.push({
              id: i,
              name,
              personalityNote,
              pricePerMessage: BigInt(pricePerMessage),
              isActive,
              totalMessages: BigInt(totalMessages),
            });
          }
        } catch (err) {
          console.error(`Error fetching leaf ${i}:`, err);
        }
      }

      setLeaves(myLeaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchMyLeaves();
    }
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Header */}
      <header className="bg-[color:var(--surface)]/90 backdrop-blur border-b border-[color:var(--surface-muted)]/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">🍃 My Leaves</h1>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isConnected ? (
          <div className="leaf-card rounded-2xl p-8 text-center border border-[color:var(--surface-muted)]/60">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Connect your wallet to view your leaves
            </p>
            <ConnectButton />
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading your leaves...</div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="leaf-card rounded-2xl p-8 text-center border border-[color:var(--surface-muted)]/60">
            <h2 className="text-2xl font-bold mb-4">No Leaves Yet</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              You haven't created any leaves yet. Create your first AI digital replica!
            </p>
            <Link
              href="/create"
              className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl hover:from-emerald-600 hover:to-sky-600 font-semibold transition-all shadow-md"
            >
              Create Your First Leaf
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Your Leaves ({leaves.length})
              </h2>
              <Link
                href="/create"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-lg hover:from-emerald-600 hover:to-sky-600 font-medium transition-all shadow-md"
              >
                + Create New Leaf
              </Link>
            </div>

            {leaves.map((leaf) => (
              <div
                key={leaf.id}
                className="leaf-card rounded-2xl p-6 border border-[color:var(--surface-muted)]/60 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{leaf.name}</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                      {leaf.personalityNote}
                    </p>
                    <div className="flex gap-3 text-sm flex-wrap mb-4">
                      <div className="leaf-pill bg-transparent text-slate-900 border border-slate-300 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30 font-semibold">
                        💰 {leaf.pricePerMessage ? formatEther(leaf.pricePerMessage) : '0'} ETH/msg
                      </div>
                      <div className="leaf-pill bg-transparent text-slate-900 border border-slate-300 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-500/30 font-semibold">
                        💬 {leaf.totalMessages ? leaf.totalMessages.toString() : '0'} messages
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
                      <div className="leaf-pill bg-transparent text-slate-900 border border-slate-300 dark:bg-indigo-500/20 dark:text-indigo-200 dark:border-indigo-500/30 font-semibold">
                        #️⃣ ID: {leaf.id}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/chat/${leaf.id}`}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-center rounded-lg hover:from-emerald-600 hover:to-sky-600 font-medium transition-all shadow-md"
                  >
                    Chat with Leaf
                  </Link>
                  <a
                    href={`${config.blockExplorer.url}/nft/${config.contracts.leafNFT}/${leaf.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[color:var(--surface)] border border-emerald-500 text-emerald-600 dark:text-emerald-400 text-center rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-medium transition-all"
                  >
                    View on BaseScan ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
