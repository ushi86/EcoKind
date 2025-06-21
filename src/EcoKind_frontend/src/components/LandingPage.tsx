import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Brain, Eye, Fingerprint, Sparkles, Lock } from 'lucide-react';

interface LandingPageProps {
  onIdentityConnect: (principalId: string) => void;
}

// Custom EcoKind Logo Component
const EcoKindLogo = ({ size = 32 }: { size?: number }) => (
  <div className="relative">
    <div className={`w-${size/4} h-${size/4} relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl rotate-12 opacity-80"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-purple-400 to-pink-400 rounded-xl -rotate-12 opacity-60"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield className={`w-${size/8} h-${size/8} text-white z-10`} />
      </div>
    </div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onIdentityConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // ========================================
  // BACKEND INTEGRATION POINT #1
  // Replace with actual Internet Identity
  // ========================================
  const handleConnectIdentity = async () => {
    setIsConnecting(true);
    
    try {
      // TODO: Replace with actual Internet Identity integration
      // const identity = await window.ic.plug.requestConnect();
      // const principal = identity.principalId;
      
      // Mock implementation - replace this
      setTimeout(() => {
        const mockPrincipalId = `rdmx6-jaaaa-aaaah-qcaiq-cai`;
        onIdentityConnect(mockPrincipalId);
        setIsConnecting(false);
      }, 2500);
      
    } catch (error) {
      console.error('Identity connection failed:', error);
      setIsConnecting(false);
    }
  };

  const features = [
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Real-time Protection",
      description: "Instant toxicity detection with sub-second response times"
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: "AI-Powered Analysis",
      description: "Advanced LLMs that understand context and nuance"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Lightning Fast",
      description: "Seamless integration with zero latency impact"
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Community Driven",
      description: "Decentralized approach ensuring privacy and transparency"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center space-x-3"
          >
            <EcoKindLogo size={40} />
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                EcoKind
              </span>
              <div className="text-xs text-gray-400 font-mono">AI Community Protection</div>
            </div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDemo(!showDemo)}
            className="px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 font-medium"
          >
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Live Demo</span>
            </div>
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <EcoKindLogo size={80} />
              </div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Protect
              </span>
              <br />
              <span className="text-white">Communities</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
              EcoKind leverages decentralized AI on the Internet Computer to detect and prevent 
              toxic messages in real-time, creating safer digital spaces for everyone.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-8">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Powered by ICP</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>VetKey Secured</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>AI-Powered</span>
              </div>
            </div>
          </motion.div>

          {/* Connect Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-16"
          >
            <button
              onClick={handleConnectIdentity}
              disabled={isConnecting}
              className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-2xl text-white font-semibold text-lg hover:from-emerald-600 hover:via-cyan-600 hover:to-purple-600 transition-all duration-500 shadow-2xl hover:shadow-emerald-500/25 disabled:opacity-70 transform hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    <span>Connecting to Internet Identity...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-6 h-6" />
                    <span>Connect Internet Identity</span>
                  </>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500 -z-10"></div>
            </button>
            
            <p className="text-sm text-gray-400 mt-4 font-mono">
              Secure • Decentralized • Privacy-First
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 group"
              >
                <div className="text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-3 text-lg">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          onClick={() => setShowDemo(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="w-6 h-6 text-emerald-400" />
              <h3 className="text-2xl font-bold text-white">Live Demo</h3>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 font-medium mb-1">Input: "You're absolutely terrible!"</p>
                <p className="text-red-300 text-sm">Toxicity: 94% • Status: Blocked</p>
              </div>
              
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-green-400 font-medium mb-1">Suggestion: "I respectfully disagree"</p>
                <p className="text-green-300 text-sm">Toxicity: 8% • Status: Approved</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowDemo(false)}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all duration-300"
            >
              Try It Live - Connect Identity
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm font-mono">
            Built on Internet Computer Protocol • Secured by VetKey • Powered by Decentralized AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;