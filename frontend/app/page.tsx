import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] transition-colors">
      {/* Header */}
      <header className="bg-[color:var(--surface)]/90 backdrop-blur border-b border-[color:var(--surface-muted)]/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">🍃 Leaf</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">AI Digital Replicas</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/my-leaves"
              className="px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
            >
              My Leaves
            </Link>
            <ThemeToggle />
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Chat with AI That Lives Forever
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Leaf creates immortal AI digital replicas on the Base blockchain.
            Each leaf preserves knowledge, personality, and can browse the internet to respond in your voice.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-xl hover:from-emerald-600 hover:to-sky-600 font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Create Your Leaf
            </Link>
            <Link
              href="/chat/1"
              className="px-8 py-4 bg-[color:var(--surface)] border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-bold text-lg transition-all"
            >
              Try Demo
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="leaf-card rounded-2xl p-6 border border-[color:var(--surface-muted)]/60">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Powered by GPT-4, each leaf can browse the internet and respond with your unique perspective.
            </p>
          </div>

          <div className="leaf-card rounded-2xl p-6 border border-[color:var(--surface-muted)]/60">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold mb-2">On-Chain Forever</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Stored on Base blockchain with IPFS. Your digital replica lives forever through a self-sustaining economic model.
            </p>
          </div>

          <div className="leaf-card rounded-2xl p-6 border border-[color:var(--surface-muted)]/60">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-xl font-bold mb-2">Pay Per Message</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Simple pricing: pay only when you chat. 70% goes to the leaf owner, 30% to platform.
            </p>
          </div>
        </div>

        {/* Demo Leaf */}
        <div className="leaf-card rounded-2xl p-8 mb-16 border border-[color:var(--surface-muted)]/60">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Try Demo Leaf</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Experience the platform by chatting with our demo leaf. Connect your wallet (needs Base Sepolia testnet ETH) and start a conversation!
          </p>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 mb-6 border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold mb-2 text-slate-900 dark:text-white">Demo Leaf - AI & Crypto Enthusiast</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              "I'm interested in crypto, AI, and building cool products. I'm excited about decentralization and practical web3 applications."
            </p>
            <div className="flex gap-2 text-sm mb-4 flex-wrap">
              <span className="leaf-pill bg-emerald-50 text-emerald-700 border border-emerald-100">💰 0.001 ETH/msg</span>
              <span className="leaf-pill bg-sky-50 text-sky-700 border border-sky-100">🌐 Internet access</span>
              <span className="leaf-pill bg-purple-50 text-purple-700 border border-purple-100">🤖 GPT-4</span>
            </div>
          </div>

          <Link
            href="/chat/1"
            className="block w-full bg-gradient-to-r from-green-500 to-blue-500 text-white text-center py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
          >
            Chat with Demo Leaf →
          </Link>
        </div>

        {/* How it Works */}
        <div className="rounded-2xl p-8 text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 shadow-2xl">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-white text-indigo-500 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold mb-1">Connect Wallet</h3>
                <p className="text-indigo-50 font-medium">Get Base Sepolia testnet ETH from the faucet</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white text-indigo-500 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold mb-1">Pay for Message</h3>
                <p className="text-indigo-50 font-medium">Each message costs 0.001 ETH (~$2-3)</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white text-indigo-500 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold mb-1">Chat with AI</h3>
                <p className="text-indigo-50 font-medium">Ask questions and get responses in the leaf's unique voice</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white text-indigo-500 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold mb-1">Earn or Preserve</h3>
                <p className="text-indigo-50 font-medium">Create your own leaf to earn passive income or preserve knowledge</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-slate-600 dark:text-slate-400">
          <p className="mb-2">Built with ❤️ on Base</p>
          <p className="text-sm">Smart Contracts • GPT-4 • IPFS • Decentralized Forever</p>
        </footer>
      </main>
    </div>
  );
}
