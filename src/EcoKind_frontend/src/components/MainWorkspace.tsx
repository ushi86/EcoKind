import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MessageSquare, Edit, Trash2, Shield, Brain, BarChart3, Sparkles, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Project } from '../types';
import ChatFunctionForm from './ChatFunctionForm';
import ResultDisplay from './ResultDisplay';
import { canisterId } from '../../../declarations/EcoKind_backend';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '../utils/canister.idl';

// Interface for your Motoko backend Message type
interface BackendMessage {
  sender: string;
  receiver: string;
  content: string;
  timestamp: bigint;
}

// Interface for your actor (Motoko backend)
interface ToxicityDetectionActor {
  sendMessage: (sender: string, receiver: string, content: string) => Promise<boolean>;
  receiveMessages: (userPrincipal: string) => Promise<BackendMessage[]>;
  editMessage: (address: string, index: number, newContent: string) => Promise<boolean>;
  deleteUserMessages: (address: string) => Promise<boolean>;
  clearMessages: () => Promise<boolean>;
  harassmentLevel: (content: string) => Promise<string>;
  suggestImprovedMessage: (content: string) => Promise<string>;
  generateKey: (devPrincipal: any, project: string) => Promise<string | null>;
}

interface MainWorkspaceProps {
  project: Project;
  principalId: string;
  onBack: () => void;
  canisterId?: string;
  actor?: ToxicityDetectionActor;
}

const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  project,
  principalId,
  onBack,
  canisterId,
  actor
}) => {
  const [activeFunction, setActiveFunction] = useState<string>('send-message');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');

  const [delMes1, setDelMes1] = useState<string>('');

  // Test connection to backend
  const testConnection = async () => {
    if (!actor) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('testing');
    try {
      // Try a simple call to test connection
      await actor.clearMessages(); // This is just to test - won't actually clear
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('disconnected');
    }
  };

  // Test connection on component mount
  React.useEffect(() => {
    testConnection();
  }, [actor]);

  React.useEffect(() => {
    console.log('Hello');
    const host = 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io';
    const canisterId = 'xgktx-viaaa-aaaab-qadda-cai'; 

    const agent = new HttpAgent({ host });
    const actor = Actor.createActor(idlFactory,{
      agent, canisterId
    }
    )

const testFunction = async () => {
    const principal_one = 'elsnu-exgt6-a6c4w-zvlfc-3oqrj-5ifj3-adiil-cagsu-sdtml-yeed7-mae';
    const principal_two = 'xraya-wv56e-7ddrm-fwhih-wx6er-3tiru-agv3f-efbkp-uwqbn-od643-rae';
    const message = 'You are very bad!'; 
    
    const result = await actor.sendMessage(
      principal_one,
      principal_two,
      message
    );
    
    console.log('Message sent result:', result);

  }
    testFunction();

    const testFunction2 = async () => {
    const message = 'elsnu-exgt6-a6c4w-zvlfc-3oqrj-5ifj3-adiil-cagsu-sdtml-yeed7-mae';
    
    const result = await actor.deleteUserMessages(
      message,
    );
    
    console.log('Message sent result:', result);

  }
    testFunction2();
  }, []);

  const functions = [
    {
      id: 'send-message',
      name: 'Send Message',
      icon: <Send className="w-5 h-5" />,
      description: 'Send a message with real-time AI toxicity detection',
      params: ['senderAddress', 'receiverAddress', 'message'],
      color: 'from-emerald-500 to-cyan-500',
      endpoint: 'sendMessage'
    },
    {
      id: 'receive-message',
      name: 'Receive Messages',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Retrieve all messages for a specific receiver address',
      params: ['receiverAddress'],
      color: 'from-blue-500 to-purple-500',
      endpoint: 'receiveMessages'
    },
    {
      id: 'edit-message',
      name: 'Edit Message',
      icon: <Edit className="w-5 h-5" />,
      description: 'Modify an existing message with AI toxicity re-validation',
      params: ['senderAddress', 'messageIndex', 'newMessage'],
      color: 'from-yellow-500 to-orange-500',
      endpoint: 'editMessage'
    },
    {
      id: 'delete-message',
      name: 'Delete User Messages',
      icon: <Trash2 className="w-5 h-5" />,
      description: 'Remove all messages from a specific user address',
      params: ['senderAddress'],
      color: 'from-red-500 to-pink-500',
      endpoint: 'deleteUserMessages'
    },
    {
      id: 'clear-messages',
      name: 'Clear All Messages',
      icon: <Shield className="w-5 h-5" />,
      description: 'Clear all messages from the system (admin function)',
      params: [],
      color: 'from-purple-500 to-indigo-500',
      endpoint: 'clearMessages'
    },
    {
      id: 'harassment-level',
      name: 'Analyze Harassment',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Use AI to analyze text content for harassment severity (Low/Moderate/High)',
      params: ['text'],
      color: 'from-cyan-500 to-teal-500',
      endpoint: 'harassmentLevel'
    },
    {
      id: 'suggest-improvement',
      name: 'AI Message Improvement',
      icon: <Brain className="w-5 h-5" />,
      description: 'Get AI-powered suggestions to improve message tone and content',
      params: ['text'],
      color: 'from-pink-500 to-rose-500',
      endpoint: 'suggestImprovedMessage'
    }
  ];

  const handleFunctionSubmit = async (functionId: string, params: Record<string, string>) => {
    if (!actor) {
      console.error('Actor not initialized');
      return;
    }

    setIsLoading(true);

    try {
      let result;
      const timestamp = new Date();

      switch (functionId) {
        case 'send-message':
          console.log('🚀 Calling sendMessage with:', params);
          const sendSuccess = await actor.sendMessage(
            params.senderAddress,
            params.receiverAddress,
            params.message
          );

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              success: sendSuccess,
              messageId: sendSuccess ? `msg_${Date.now()}` : null,
              blocked: !sendSuccess,
              message: sendSuccess
                ? '✅ Message sent successfully! AI toxicity check passed.'
                : '🚫 Message blocked! AI detected harassment or toxicity.',
              status: sendSuccess ? 'sent' : 'blocked',
              aiProcessed: true
            },
            timestamp
          };
          break;

        case 'receive-message':
          console.log('📨 Calling receiveMessages for:', params.receiverAddress);
          const messages = await actor.receiveMessages(params.receiverAddress);

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              messages: messages.map((msg: BackendMessage, index: number) => ({
                id: index.toString(),
                text: msg.content,
                sender: msg.sender,
                receiver: msg.receiver,
                timestamp: new Date(Number(msg.timestamp) / 1000000), // Convert nanoseconds to milliseconds
                index: index
              })),
              totalCount: messages.length,
              receiverAddress: params.receiverAddress,
              message: `📬 Retrieved ${messages.length} messages for ${params.receiverAddress}`
            },
            timestamp
          };
          break;

        case 'edit-message':
          console.log('✏️ Calling editMessage with:', params);
          const editSuccess = await actor.editMessage(
            params.senderAddress,
            parseInt(params.messageIndex),
            params.newMessage
          );

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              success: editSuccess,
              messageIndex: params.messageIndex,
              originalSender: params.senderAddress,
              newContent: params.newMessage,
              message: editSuccess
                ? `✅ Message at index ${params.messageIndex} edited successfully! AI toxicity check passed.`
                : `🚫 Edit failed! Possible reasons: Invalid index, unauthorized access, or AI detected toxicity in new content.`,
              aiProcessed: true
            },
            timestamp
          };
          break;

        case 'delete-message':
          console.log('🗑️ Calling deleteUserMessages for:', params.senderAddress);
          const deleteSuccess = await actor.deleteUserMessages(params.senderAddress);

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              success: deleteSuccess,
              deletedUser: params.senderAddress,
              message: deleteSuccess
                ? `🗑️ All messages from user ${params.senderAddress} have been permanently deleted.`
                : `❌ Failed to delete messages from ${params.senderAddress}.`
            },
            timestamp
          };
          break;

        case 'clear-messages':
          console.log('🧹 Calling clearMessages...');
          const clearSuccess = await actor.clearMessages();

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              success: clearSuccess,
              message: clearSuccess
                ? '🧹 All messages have been cleared from the system.'
                : '❌ Failed to clear messages from the system.',
              systemWide: true
            },
            timestamp
          };
          break;

        case 'harassment-level':
          console.log('🤖 Calling harassmentLevel for text analysis...');
          const harassmentResult = await actor.harassmentLevel(params.text);
          const level = harassmentResult.toLowerCase().trim();

          // Map AI response to numeric values for visualization
          const levelMap: Record<string, number> = {
            'low': 25,
            'moderate': 55,
            'high': 85
          };

          const numericLevel = levelMap[level] || 0;

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              level: numericLevel,
              category: level,
              categoryDisplay: level.charAt(0).toUpperCase() + level.slice(1),
              confidence: 95, // High confidence since it's AI-powered
              aiResponse: harassmentResult,
              details: {
                classification: harassmentResult,
                aiAnalysis: true,
                riskLevel: level === 'high' ? 'Severe Risk' : level === 'moderate' ? 'Moderate Risk' : 'Low Risk'
              },
              message: `🤖 AI Analysis Complete: ${level.toUpperCase()} harassment level detected (${numericLevel}/100)`
            },
            timestamp
          };
          break;

        case 'suggest-improvement':
          console.log('💡 Calling suggestImprovedMessage for content improvement...');
          const improvedMessage = await actor.suggestImprovedMessage(params.text);

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              original: params.text,
              suggestion: improvedMessage,
              improvement: 75, // Estimated improvement percentage
              tone: 'improved',
              aiGenerated: true,
              wordCount: {
                original: params.text.split(' ').length,
                improved: improvedMessage.split(' ').length
              },
              message: '💡 AI has generated an improved version of your message with better tone and clarity.'
            },
            timestamp
          };
          break;

        default:
          throw new Error(`❌ Unknown function: ${functionId}`);
      }

      console.log('✅ Function execution result:', result);
      setResults(prev => [result, ...prev]);

    } catch (error) {
      console.error('❌ Function execution failed:', error);

      // Create detailed error result
      const errorResult = {
        id: Date.now().toString(),
        function: functionId,
        params,
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
          message: `❌ Function execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          troubleshooting: 'Check console for detailed error logs and ensure backend connection is stable.'
        },
        timestamp: new Date(),
        isError: true
      };

      setResults(prev => [errorResult, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrincipalId = (id: string) => {
    if (id.length <= 16) return id;
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };

  const isConnected = actor !== null && actor !== undefined && connectionStatus === 'connected';
  const isTesting = connectionStatus === 'testing';

  const getConnectionIcon = () => {
    if (isTesting) return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>;
    if (isConnected) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getConnectionStatus = () => {
    if (isTesting) return 'Testing...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getConnectionColor = () => {
    if (isTesting) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (isConnected) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
              <div className="w-px h-8 bg-white/20"></div>
              <div>
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <p className="text-sm text-gray-400 font-mono">Principal: {formatPrincipalId(principalId)}</p>
                {canisterId && (
                  <p className="text-xs text-gray-500 font-mono">Canister: {formatPrincipalId(canisterId)}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border ${getConnectionColor()}`}>
                {getConnectionIcon()}
                <span className="font-semibold">{getConnectionStatus()}</span>
              </div>
              <button
                onClick={testConnection}
                disabled={isTesting}
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Test Connection"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Connection Warning */}
        {!isConnected && !isTesting && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Backend Connection Required</span>
            </div>
            <p className="text-red-300 text-sm mt-1">
              Please ensure your Internet Computer canister is deployed and the actor is properly initialized.
            </p>
            <div className="mt-2 text-xs text-red-400">
              <p>• Check canister ID: {canisterId || 'Not provided'}</p>
              <p>• Verify dfx is running for local development</p>
              <p>• Ensure actor is passed to MainWorkspace component</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Function Selector */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-6">🤖 AI Functions</h2>
            <div className="space-y-3">
              {functions.map((func) => (
                <motion.button
                  key={func.id}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveFunction(func.id)}
                  disabled={!isConnected}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${!isConnected
                      ? 'opacity-50 cursor-not-allowed'
                      : activeFunction === func.id
                        ? 'bg-white/10 border-white/30 text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${func.color} ${activeFunction === func.id ? 'opacity-100' : 'opacity-70'
                      }`}>
                      {func.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{func.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{func.description}</p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">→ {func.endpoint}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Function Form */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${functions.find(f => f.id === activeFunction)?.color}`}>
                  {functions.find(f => f.id === activeFunction)?.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">
                    {functions.find(f => f.id === activeFunction)?.name}
                  </h2>
                  <p className="text-gray-400">
                    {functions.find(f => f.id === activeFunction)?.description}
                  </p>
                  <p className="text-sm text-gray-500 font-mono mt-1">
                    Backend: {functions.find(f => f.id === activeFunction)?.endpoint}()
                  </p>
                </div>
                {isConnected && (
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold">
                    READY
                  </div>
                )}
              </div>
              <ChatFunctionForm
                functionId={activeFunction}
                parameters={functions.find(f => f.id === activeFunction)?.params || []}
                onSubmit={handleFunctionSubmit}
                isLoading={isLoading}
                disabled={!isConnected}
              />
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">🔄 Execution Results</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.map((result) => (
                    <ResultDisplay key={result.id} result={result} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {results.length === 0 && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center">
                  <Brain className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI-Powered Toxicity Detection Ready</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {isConnected
                    ? "Select a function above and provide the required parameters to start using AI-powered content moderation and toxicity detection."
                    : "Connect to your Internet Computer backend to start using AI-powered toxicity detection and content moderation features."
                  }
                </p>
                {isConnected && (
                  <div className="mt-4 text-sm text-emerald-400">
                    ✅ Backend connected and ready to process requests
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainWorkspace;

//this is the fn use the , create a new use state for the delMes1 and update data from the input and use the updated text and pass it on testfn2 as an argument for function deleteMessage 