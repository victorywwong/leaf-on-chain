import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-600">🍃 Leaf</h1>
            <p className="text-sm text-gray-600">AI Digital Replicas</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Chat with AI That Lives Forever
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Leaf creates immortal AI digital replicas on the Base blockchain.
            Each leaf preserves knowledge, personality, and can browse the internet to respond in your voice.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Powered by GPT-4, each leaf can browse the internet and respond with your unique perspective.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold mb-2">On-Chain Forever</h3>
            <p className="text-gray-600">
              Stored on Base blockchain with IPFS. Your digital replica lives forever through a self-sustaining economic model.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-xl font-bold mb-2">Pay Per Message</h3>
            <p className="text-gray-600">
              Simple pricing: pay only when you chat. 70% goes to the leaf owner, 30% to platform.
            </p>
          </div>
        </div>

        {/* Demo Leaf */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-4">Try Demo Leaf</h2>
          <p className="text-gray-600 mb-6">
            Experience the platform by chatting with our demo leaf. Connect your wallet (needs Base Sepolia testnet ETH) and start a conversation!
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold mb-2">Demo Leaf - AI & Crypto Enthusiast</h3>
            <p className="text-sm text-gray-600 mb-4">
              "I'm interested in crypto, AI, and building cool products. I'm excited about decentralization and practical web3 applications."
            </p>
            <div className="flex gap-2 text-sm mb-4">
              <span className="bg-green-100 px-3 py-1 rounded-full">💰 0.001 ETH/msg</span>
              <span className="bg-blue-100 px-3 py-1 rounded-full">🌐 Internet access</span>
              <span className="bg-purple-100 px-3 py-1 rounded-full">🤖 GPT-4</span>
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
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-white text-blue-500 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-bold mb-1">Connect Wallet</h3>
                <p className="text-blue-100">Get Base Sepolia testnet ETH from the faucet</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white text-blue-500 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-bold mb-1">Pay for Message</h3>
                <p className="text-blue-100">Each message costs 0.001 ETH (~$2-3)</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white text-blue-500 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-bold mb-1">Chat with AI</h3>
                <p className="text-blue-100">Ask questions and get responses in the leaf's unique voice</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-white text-blue-500 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-bold mb-1">Earn or Preserve</h3>
                <p className="text-blue-100">Create your own leaf to earn passive income or preserve knowledge</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-600">
          <p className="mb-2">Built with ❤️ on Base</p>
          <p className="text-sm">Smart Contracts • GPT-4 • IPFS • Decentralized Forever</p>
        </footer>
      </main>
    </div>
  );
}
