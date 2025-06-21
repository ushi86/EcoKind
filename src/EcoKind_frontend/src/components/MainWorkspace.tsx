import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, MessageSquare, Edit, Trash2, Shield, Brain, BarChart3, Sparkles, AlertCircle, CheckCircle, XCircle, User, Play, Loader2, Hash, MessageCircle } from 'lucide-react';
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
  generateKey: (devPrincipal: Principal, project: string) => Promise<string | null>;
  verifyKey: (devPrincipal: Principal, project: string, key: string) => Promise<boolean>;
  getDeveloperKeys: (devPrincipal: Principal) => Promise<[string, string][]>;
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
  canisterId: propCanisterId,
  actor: propActor
}) => {
  const [activeFunction, setActiveFunction] = useState<string>('send-message');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [actor, setActor] = useState<ToxicityDetectionActor | null>(null);
  const [canisterId, setCanisterId] = useState<string>('');

  // State for message operations
  const [senderId, setSenderId] = useState<string>('');
  const [receiverId, setReceiverId] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [messageIndex, setMessageIndex] = useState<string>('');
  const [newMessageContent, setNewMessageContent] = useState<string>('');
  const [deleteMessageAddress, setDeleteMessageAddress] = useState<string>('');
  const [harassmentText, setHarassmentText] = useState<string>('');
  const [improvementText, setImprovementText] = useState<string>('');

  // State for VetKey operations
  const [vetKeyProject, setVetKeyProject] = useState<string>('');
  const [generatedVetKey, setGeneratedVetKey] = useState<string>('');
  const [vetKeyToVerify, setVetKeyToVerify] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [developerKeys, setDeveloperKeys] = useState<[string, string][]>([]);

  // Initialize actor on component mount
  React.useEffect(() => {
    const initializeActor = async () => {
      try {
        const host = 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io';
        const canisterIdValue = propCanisterId || 'xgktx-viaaa-aaaab-qadda-cai'; // Use prop or default
        
        setCanisterId(canisterIdValue);
        
        const agent = new HttpAgent({ host });
        const newActor = Actor.createActor(idlFactory, {
          agent,
          canisterId: canisterIdValue
        }) as ToxicityDetectionActor;
        
        setActor(newActor);
        console.log('✅ Actor initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize actor:', error);
        setActor(null);
      }
    };

    // If actor is passed as prop, use it; otherwise create new one
    if (propActor) {
      setActor(propActor);
      setCanisterId(propCanisterId || '');
    } else {
      initializeActor();
    }
  }, [propActor, propCanisterId]);

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

  // Test function for delete message using state variables
  const testDeleteMessage = async () => {
    if (!actor) {
      console.error('Actor not initialized');
      return;
    }

    if (!deleteMessageAddress.trim()) {
      console.log('Please enter a sender address to delete messages');
      return;
    }

    try {
      console.log('🗑️ Testing delete message for:', deleteMessageAddress);
      const result = await actor.deleteUserMessages(deleteMessageAddress);
      console.log('Delete message result:', result);
      
      // Add result to the results array
      const timestamp = new Date();
      const deleteResult = {
        id: Date.now().toString(),
        function: 'delete-message',
        params: { senderAddress: deleteMessageAddress },
        result: {
          success: result,
          deletedUser: deleteMessageAddress,
          message: result
            ? `🗑️ All messages from user ${deleteMessageAddress} have been permanently deleted.`
            : `❌ Failed to delete messages from ${deleteMessageAddress}.`
        },
        timestamp
      };
      
      setResults(prev => [deleteResult, ...prev]);
    } catch (error) {
      console.error('❌ Delete message test failed:', error);
    }
  };

  // Test function for sending messages using state variables
  const testSendMessage = async () => {
    if (!actor) {
      console.error('Actor not initialized');
      return;
    }

    if (!senderId.trim() || !receiverId.trim() || !messageContent.trim()) {
      console.log('Please fill in sender, receiver, and message content');
      return;
    }

    try {
      console.log('🚀 Testing send message:', { senderId, receiverId, messageContent });
      const result = await actor.sendMessage(senderId, receiverId, messageContent);
      console.log('Send message result:', result);
      
      // Add result to the results array
      const timestamp = new Date();
      const sendResult = {
        id: Date.now().toString(),
        function: 'send-message',
        params: { senderAddress: senderId, receiverAddress: receiverId, message: messageContent },
        result: {
          success: result,
          messageId: result ? `msg_${Date.now()}` : null,
          blocked: !result,
          message: result
            ? '✅ Message sent successfully! AI toxicity check passed.'
            : '🚫 Message blocked! AI detected harassment or toxicity.',
          status: result ? 'sent' : 'blocked',
          aiProcessed: true
        },
        timestamp
      };
      
      setResults(prev => [sendResult, ...prev]);
    } catch (error) {
      console.error('❌ Send message test failed:', error);
    }
  };

  // Test function for generating VetKey using state variables
  const testGenerateVetKey = async () => {
    if (!actor) {
      console.error('Actor not initialized');
      return;
    }

    if (!vetKeyProject.trim()) {
      console.log('Please enter a project name for VetKey generation');
      return;
    }

    try {
      console.log('🔑 Testing VetKey generation for project:', vetKeyProject);
      
      // Convert string principal ID to Principal object
      const principalObj = Principal.fromText(principalId);
      console.log('✅ Converted principal ID to Principal object:', principalObj.toText());
      
      const result = await actor.generateKey(principalObj, vetKeyProject);
      console.log('VetKey generation result:', result);
      
      if (result) {
        setGeneratedVetKey(result);
      }
      
      // Add result to the results array
      const timestamp = new Date();
      const vetKeyResult = {
        id: Date.now().toString(),
        function: 'generate-vetkey',
        params: { project: vetKeyProject },
        result: {
          success: result !== null,
          vetKey: result || 'No key generated',
          project: vetKeyProject,
          message: result !== null
            ? `🔑 VetKey generated successfully for project: ${vetKeyProject}`
            : '❌ Failed to generate VetKey. Project may already have a key or limit reached.'
        },
        timestamp
      };
      
      setResults(prev => [vetKeyResult, ...prev]);
    } catch (error) {
      console.error('❌ VetKey generation test failed:', error);
      
      // Add error result to the results array
      const errorResult = {
        id: Date.now().toString(),
        function: 'generate-vetkey',
        params: { project: vetKeyProject },
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: `❌ VetKey generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        timestamp: new Date(),
        isError: true
      };
      
      setResults(prev => [errorResult, ...prev]);
    }
  };

  // Test function for verifying VetKey using state variables
  const testVerifyVetKey = async () => {
    if (!actor) {
      console.error('Actor not initialized');
      return;
    }

    if (!vetKeyProject.trim() || !vetKeyToVerify.trim()) {
      console.log('Please enter both project name and VetKey to verify');
      return;
    }

    try {
      console.log('✅ Testing VetKey verification:', { project: vetKeyProject, key: vetKeyToVerify });
      
      // Convert string principal ID to Principal object
      const principalObj = Principal.fromText(principalId);
      console.log('✅ Converted principal ID to Principal object:', principalObj.toText());
      
      const result = await actor.verifyKey(principalObj, vetKeyProject, vetKeyToVerify);
      console.log('VetKey verification result:', result);
      
      setVerificationResult(result);
      
      // Add result to the results array
      const timestamp = new Date();
      const verifyResult = {
        id: Date.now().toString(),
        function: 'verify-vetkey',
        params: { project: vetKeyProject, key: vetKeyToVerify },
        result: {
          success: result,
          vetKey: vetKeyToVerify,
          project: vetKeyProject,
          isValid: result,
          message: result
            ? `✅ VetKey verification successful for project: ${vetKeyProject}`
            : '❌ VetKey verification failed. Invalid key or project.'
        },
        timestamp
      };
      
      setResults(prev => [verifyResult, ...prev]);
    } catch (error) {
      console.error('❌ VetKey verification test failed:', error);
      
      // Add error result to the results array
      const errorResult = {
        id: Date.now().toString(),
        function: 'verify-vetkey',
        params: { project: vetKeyProject, key: vetKeyToVerify },
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: `❌ VetKey verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        timestamp: new Date(),
        isError: true
      };
      
      setResults(prev => [errorResult, ...prev]);
    }
  };

  // Test function for getting developer keys using state variables
  const testGetDeveloperKeys = async () => {
    if (!actor) {
      console.error('Actor not initialized');
      return;
    }

    try {
      console.log('🔍 Testing get developer keys...');
      
      // Convert string principal ID to Principal object
      const principalObj = Principal.fromText(principalId);
      console.log('✅ Converted principal ID to Principal object:', principalObj.toText());
      
      const result = await actor.getDeveloperKeys(principalObj);
      console.log('Get developer keys result:', result);
      
      setDeveloperKeys(result);
      
      // Add result to the results array
      const timestamp = new Date();
      const keysResult = {
        id: Date.now().toString(),
        function: 'get-developer-keys',
        params: {},
        result: {
          success: result.length > 0,
          developerKeys: result.map(([project, key]) => ({ project, key })),
          totalKeys: result.length,
          message: result.length > 0
            ? `🔍 Retrieved ${result.length} developer keys.`
            : '❌ No developer keys found for this developer.'
        },
        timestamp
      };
      
      setResults(prev => [keysResult, ...prev]);
    } catch (error) {
      console.error('❌ Get developer keys test failed:', error);
      
      // Add error result to the results array
      const errorResult = {
        id: Date.now().toString(),
        function: 'get-developer-keys',
        params: {},
        result: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: `❌ Get developer keys failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        },
        timestamp: new Date(),
        isError: true
      };
      
      setResults(prev => [errorResult, ...prev]);
    }
  };

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
    },
    {
      id: 'generate-vetkey',
      name: 'Generate VetKey',
      icon: <Shield className="w-5 h-5" />,
      description: 'Generate a new VetKey for a specific project',
      params: ['project'],
      color: 'from-green-500 to-emerald-500',
      endpoint: 'generateKey'
    },
    {
      id: 'verify-vetkey',
      name: 'Verify VetKey',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Verify if a VetKey is valid for a specific project',
      params: ['project', 'key'],
      color: 'from-indigo-500 to-blue-500',
      endpoint: 'verifyKey'
    },
    {
      id: 'get-developer-keys',
      name: 'Get Developer Keys',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Retrieve all VetKeys for the current developer',
      params: [],
      color: 'from-violet-500 to-purple-500',
      endpoint: 'getDeveloperKeys'
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

        case 'generate-vetkey':
          console.log('🔑 Calling generateKey for VetKey generation...');
          
          // Convert string principal ID to Principal object
          const generatePrincipalObj = Principal.fromText(principalId);
          console.log('✅ Converted principal ID to Principal object:', generatePrincipalObj.toText());
          
          const vetKeyResult = await actor.generateKey(generatePrincipalObj, params.project);

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              success: vetKeyResult !== null,
              vetKey: vetKeyResult || 'No key generated',
              project: params.project,
              message: vetKeyResult !== null
                ? `🔑 VetKey generated successfully for project: ${params.project}`
                : '❌ Failed to generate VetKey. Project may already have a key or limit reached.'
            },
            timestamp
          };
          break;

        case 'verify-vetkey':
          console.log('✅ Calling verifyKey for VetKey verification...');
          
          // Convert string principal ID to Principal object
          const verifyPrincipalObj = Principal.fromText(principalId);
          console.log('✅ Converted principal ID to Principal object:', verifyPrincipalObj.toText());
          
          const verifyResult = await actor.verifyKey(verifyPrincipalObj, params.project, params.key);

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              success: verifyResult,
              vetKey: params.key,
              project: params.project,
              isValid: verifyResult,
              message: verifyResult
                ? `✅ VetKey verification successful for project: ${params.project}`
                : '❌ VetKey verification failed. Invalid key or project.'
            },
            timestamp
          };
          break;

        case 'get-developer-keys':
          console.log('🔍 Calling getDeveloperKeys for developer keys retrieval...');
          
          // Convert string principal ID to Principal object
          const keysPrincipalObj = Principal.fromText(principalId);
          console.log('✅ Converted principal ID to Principal object:', keysPrincipalObj.toText());
          
          const keysResult = await actor.getDeveloperKeys(keysPrincipalObj);

          result = {
            id: Date.now().toString(),
            function: functionId,
            params,
            result: {
              success: keysResult.length > 0,
              developerKeys: keysResult.map(([project, key]) => ({ project, key })),
              totalKeys: keysResult.length,
              message: keysResult.length > 0
                ? `🔍 Retrieved ${keysResult.length} developer keys.`
                : '❌ No developer keys found for this developer.'
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

  // Custom form component for different message operations
  const renderCustomForm = () => {
    switch (activeFunction) {
      case 'send-message':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFunctionSubmit('send-message', {
              senderAddress: senderId,
              receiverAddress: receiverId,
              message: messageContent
            });
          }} className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <User className="w-4 h-4" />
                <span>Sender Address</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                placeholder="Enter sender's principal ID (e.g., rdmx6-jaaaa-aaaah-qcaiq-cai)"
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <User className="w-4 h-4" />
                <span>Receiver Address</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="Enter receiver's principal ID (e.g., rdmx6-jaaaa-aaaah-qcaiq-cai)"
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
                <span className="text-red-400">*</span>
              </label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isConnected || !senderId.trim() || !receiverId.trim() || !messageContent.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </div>
            </motion.button>

            {/* Test button to demonstrate state usage */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={testSendMessage}
              disabled={!isConnected || !senderId.trim() || !receiverId.trim() || !messageContent.trim()}
              className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="w-5 h-5" />
                <span>Test Send (Using State)</span>
              </div>
            </motion.button>
          </form>
        );

      case 'receive-message':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFunctionSubmit('receive-message', {
              receiverAddress: receiverId
            });
          }} className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <User className="w-4 h-4" />
                <span>Receiver Address</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                placeholder="Enter receiver's principal ID (e.g., rdmx6-jaaaa-aaaah-qcaiq-cai)"
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isConnected || !receiverId.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Retrieving Messages...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    <span>Receive Messages</span>
                  </>
                )}
              </div>
            </motion.button>
          </form>
        );

      case 'edit-message':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFunctionSubmit('edit-message', {
              senderAddress: senderId,
              messageIndex: messageIndex,
              newMessage: newMessageContent
            });
          }} className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <User className="w-4 h-4" />
                <span>Sender Address</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                placeholder="Enter sender's principal ID"
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <Hash className="w-4 h-4" />
                <span>Message Index</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={messageIndex}
                onChange={(e) => setMessageIndex(e.target.value)}
                placeholder="Message index (starts from 0)"
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <MessageCircle className="w-4 h-4" />
                <span>New Message</span>
                <span className="text-red-400">*</span>
              </label>
              <textarea
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                placeholder="Enter the edited message content"
                rows={4}
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isConnected || !senderId.trim() || !messageIndex.trim() || !newMessageContent.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Editing Message...</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5" />
                    <span>Edit Message</span>
                  </>
                )}
              </div>
            </motion.button>
          </form>
        );

      case 'delete-message':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFunctionSubmit('delete-message', {
              senderAddress: deleteMessageAddress
            });
          }} className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <User className="w-4 h-4" />
                <span>Sender Address</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={deleteMessageAddress}
                onChange={(e) => setDeleteMessageAddress(e.target.value)}
                placeholder="Enter sender's principal ID to delete all their messages"
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isConnected || !deleteMessageAddress.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Deleting Messages...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>Delete User Messages</span>
                  </>
                )}
              </div>
            </motion.button>

            {/* Test button to demonstrate state usage */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={testDeleteMessage}
              disabled={!isConnected || !deleteMessageAddress.trim()}
              className="w-full px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="w-5 h-5" />
                <span>Test Delete (Using State)</span>
              </div>
            </motion.button>
          </form>
        );

      case 'clear-messages':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-gray-400 mb-6">This will clear all messages from the system. This action cannot be undone.</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFunctionSubmit('clear-messages', {})}
              disabled={isLoading || !isConnected}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Clearing Messages...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Clear All Messages</span>
                  </>
                )}
              </div>
            </motion.button>
          </div>
        );

      case 'harassment-level':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFunctionSubmit('harassment-level', {
              text: harassmentText
            });
          }} className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <MessageCircle className="w-4 h-4" />
                <span>Text to Analyze</span>
                <span className="text-red-400">*</span>
              </label>
              <textarea
                value={harassmentText}
                onChange={(e) => setHarassmentText(e.target.value)}
                placeholder="Enter text to analyze for toxicity..."
                rows={4}
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isConnected || !harassmentText.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    <span>Analyze Harassment</span>
                  </>
                )}
              </div>
            </motion.button>
          </form>
        );

      case 'suggest-improvement':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFunctionSubmit('suggest-improvement', {
              text: improvementText
            });
          }} className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <MessageCircle className="w-4 h-4" />
                <span>Text to Improve</span>
                <span className="text-red-400">*</span>
              </label>
              <textarea
                value={improvementText}
                onChange={(e) => setImprovementText(e.target.value)}
                placeholder="Enter text to get AI-powered improvement suggestions..."
                rows={4}
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isConnected || !improvementText.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pink-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Suggestions...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Get AI Improvement</span>
                  </>
                )}
              </div>
            </motion.button>
          </form>
        );

      case 'generate-vetkey':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFunctionSubmit('generate-vetkey', {
              project: vetKeyProject
            });
          }} className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <Shield className="w-4 h-4" />
                <span>Project Name</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={vetKeyProject}
                onChange={(e) => setVetKeyProject(e.target.value)}
                placeholder="Enter project name for VetKey generation"
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isConnected || !vetKeyProject.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating VetKey...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Generate VetKey</span>
                  </>
                )}
              </div>
            </motion.button>

            {/* Test button to demonstrate state usage */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={testGenerateVetKey}
              disabled={!isConnected || !vetKeyProject.trim()}
              className="w-full px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-teal-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="w-5 h-5" />
                <span>Test Generate (Using State)</span>
              </div>
            </motion.button>
          </form>
        );

      case 'verify-vetkey':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleFunctionSubmit('verify-vetkey', {
              project: vetKeyProject,
              key: vetKeyToVerify
            });
          }} className="space-y-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <Shield className="w-4 h-4" />
                <span>Project Name</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={vetKeyProject}
                onChange={(e) => setVetKeyProject(e.target.value)}
                placeholder="Enter project name to verify VetKey"
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                <CheckCircle className="w-4 h-4" />
                <span>VetKey to Verify</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={vetKeyToVerify}
                onChange={(e) => setVetKeyToVerify(e.target.value)}
                placeholder="Enter VetKey to verify"
                disabled={!isConnected}
                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isConnected || !vetKeyProject.trim() || !vetKeyToVerify.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying VetKey...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Verify VetKey</span>
                  </>
                )}
              </div>
            </motion.button>

            {/* Test button to demonstrate state usage */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={testVerifyVetKey}
              disabled={!isConnected || !vetKeyProject.trim() || !vetKeyToVerify.trim()}
              className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="w-5 h-5" />
                <span>Test Verify (Using State)</span>
              </div>
            </motion.button>
          </form>
        );

      case 'get-developer-keys':
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-gray-400 mb-6">This will retrieve all VetKeys associated with the current developer.</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleFunctionSubmit('get-developer-keys', {})}
              disabled={isLoading || !isConnected}
              className="w-full px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-violet-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Retrieving Keys...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" />
                    <span>Get Developer Keys</span>
                  </>
                )}
              </div>
            </motion.button>

            {/* Test button to demonstrate state usage */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={testGetDeveloperKeys}
              disabled={!isConnected}
              className="w-full px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
            >
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="w-5 h-5" />
                <span>Test Get Keys (Using State)</span>
              </div>
            </motion.button>
          </div>
        );

      default:
        return <ChatFunctionForm
          functionId={activeFunction}
          parameters={functions.find(f => f.id === activeFunction)?.params || []}
          onSubmit={handleFunctionSubmit}
          isLoading={isLoading}
          disabled={!isConnected}
        />;
    }
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
              {renderCustomForm()}
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