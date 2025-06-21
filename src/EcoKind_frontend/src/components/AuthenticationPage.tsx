import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, ArrowLeft, CheckCircle, AlertCircle, Zap, Lock, Sparkles, Play } from 'lucide-react';
import { Project } from '../types';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '../utils/canister.idl';

// Interface for your actor (Motoko backend)
interface ToxicityDetectionActor {
  sendMessage: (sender: string, receiver: string, content: string) => Promise<boolean>;
  receiveMessages: (userPrincipal: string) => Promise<any[]>;
  editMessage: (address: string, index: number, newContent: string) => Promise<boolean>;
  deleteUserMessages: (address: string) => Promise<boolean>;
  clearMessages: () => Promise<boolean>;
  harassmentLevel: (content: string) => Promise<string>;
  suggestImprovedMessage: (content: string) => Promise<string>;
  generateKey: (devPrincipal: Principal, project: string) => Promise<string | null>;
  verifyKey: (devPrincipal: Principal, project: string, key: string) => Promise<boolean>;
  getDeveloperKeys: (devPrincipal: Principal) => Promise<[string, string][]>;
}

interface AuthenticationPageProps {
  project: Project;
  onAuthenticate: (key: string) => void;
  onBack: () => void;
  principalId?: string;
}

const AuthenticationPage: React.FC<AuthenticationPageProps> = ({
  project,
  onAuthenticate,
  onBack,
  principalId = 'rdmx6-jaaaa-aaaah-qcaiq-cai'
}) => {
  const [generatedKey, setGeneratedKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [actor, setActor] = useState<ToxicityDetectionActor | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize actor on component mount
  useEffect(() => {
    const initializeActor = async () => {
      try {
        const host = 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io';
        const canisterId = 'xgktx-viaaa-aaaab-qadda-cai';
        
        const agent = new HttpAgent({ host });
        const newActor = Actor.createActor(idlFactory, {
          agent,
          canisterId
        }) as ToxicityDetectionActor;
        
        setActor(newActor);
        setIsConnected(true);
        console.log('✅ Actor initialized successfully in AuthenticationPage');
      } catch (error) {
        console.error('❌ Failed to initialize actor in AuthenticationPage:', error);
        setActor(null);
        setIsConnected(false);
      }
    };

    initializeActor();
  }, []);

  // Generate VetKey using backend function
  const generateAuthKey = async () => {
    if (!actor || !isConnected) {
      setError('Backend connection not available. Please try again.');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      console.log('🔑 Generating VetKey for project:', project.name);
      
      // Convert string principal ID to Principal object
      const principalObj = Principal.fromText(principalId);
      console.log('✅ Converted principal ID to Principal object:', principalObj.toText());
      
      const vetKeyResult = await actor.generateKey(principalObj, project.name);
      
      if (vetKeyResult) {
        setGeneratedKey(vetKeyResult);
        setShowKey(true);
        console.log('✅ VetKey generated successfully:', vetKeyResult);
      } else {
        setError('Failed to generate VetKey. Project may already have a key or limit reached.');
        console.log('❌ VetKey generation failed - no key returned');
      }
    } catch (error) {
      console.error('❌ VetKey generation failed:', error);
      setError(`Failed to generate authentication key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Proceed directly to workspace with generated key
  const handleProceedToWorkspace = () => {
    if (generatedKey) {
      onAuthenticate(generatedKey);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to Dashboard</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center relative">
              <Key className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl blur opacity-50 animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Project Authentication</h2>
            <p className="text-gray-400 text-lg">Secure access to "{project.name}"</p>
          </div>

          {/* VetKey Branding */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-purple-400 font-bold text-lg">Powered by VetKey</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Advanced cryptographic authentication system built on the Internet Computer Protocol, 
              ensuring maximum security for your project access.
            </p>
            
            {/* Connection Status */}
            <div className="mt-4 flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
              <span className={`text-sm font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
              </span>
            </div>
          </div>

          {/* Generate Key */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                1
              </div>
              <h3 className="text-white font-bold text-lg">Generate Authentication Key</h3>
            </div>
            
            {!showKey ? (
              <button
                onClick={generateAuthKey}
                disabled={isGenerating || !isConnected}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-purple-500/25"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generating Secure Key...</span>
                  </div>
                ) : !isConnected ? (
                  <div className="flex items-center justify-center space-x-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>Backend Not Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <Lock className="w-5 h-5" />
                    <span>Generate VetKey Authentication</span>
                  </div>
                )}
              </button>
            ) : (
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-300">Your Authentication Key:</span>
                  <button
                    onClick={copyToClipboard}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium px-3 py-1 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 transition-all duration-200"
                  >
                    Copy Key
                  </button>
                </div>
                <div className="font-mono text-sm text-white bg-black/40 p-4 rounded-lg border border-slate-600 break-all">
                  {generatedKey}
                </div>
              </div>
            )}
          </div>

          {/* Proceed Button */}
          {showKey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  2
                </div>
                <h3 className="text-white font-bold text-lg">Proceed to Workspace</h3>
              </div>
              
              <button
                onClick={handleProceedToWorkspace}
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Play className="w-5 h-5" />
                  <span>Enter Workspace</span>
                </div>
              </button>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Security Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-yellow-400 mt-1" />
              <div>
                <p className="text-yellow-400 font-bold mb-2">Security Notice</p>
                <p className="text-yellow-300 text-sm leading-relaxed">
                  Your authentication key provides secure access to your project's sensitive operations. 
                  Keep it confidential and never share it with unauthorized users.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthenticationPage;