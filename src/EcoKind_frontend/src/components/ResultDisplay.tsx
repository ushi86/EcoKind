import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare, BarChart3, Lightbulb, Clock, Shield } from 'lucide-react';

interface ResultDisplayProps {
  result: {
    id: string;
    function: string;
    params: Record<string, string>;
    result: any;
    timestamp: Date;
  };
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const getStatusIcon = (functionId: string, data: any) => {
    switch (functionId) {
      case 'send-message':
        return data.blocked ? 
          <XCircle className="w-5 h-5 text-red-400" /> : 
          <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'harassment-level':
        const level = data.level || 0;
        if (level > 70) return <XCircle className="w-5 h-5 text-red-400" />;
        if (level > 40) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  const getResultContent = () => {
    switch (result.function) {
      case 'send-message':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">Status</div>
                <div className={`font-bold ${result.result.blocked ? 'text-red-400' : 'text-green-400'}`}>
                  {result.result.blocked ? 'Message Blocked' : 'Message Sent'}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">Message ID</div>
                <div className="font-mono text-sm text-cyan-400">{result.result.messageId}</div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">Toxicity Analysis</span>
                <span className="text-xs text-gray-400">Confidence: {result.result.confidence}%</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.result.toxicityLevel > 70 ? 'bg-red-500' :
                      result.result.toxicityLevel > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${result.result.toxicityLevel}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold text-white min-w-[3rem]">{result.result.toxicityLevel}%</span>
              </div>
            </div>
          </div>
        );

      case 'receive-message':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-semibold">
                {result.result.totalCount} messages retrieved
              </span>
            </div>
            <div className="space-y-3">
              {result.result.messages?.slice(0, 3).map((msg: any, index: number) => (
                <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-400">From: {msg.sender}</div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        msg.toxicity > 50 ? 'bg-red-400' : 
                        msg.toxicity > 25 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}></div>
                      <span className="text-xs text-gray-400">{msg.toxicity}% toxic</span>
                    </div>
                  </div>
                  <div className="text-white">{msg.text}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'harassment-level':
        return (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-300">Harassment Analysis</span>
                <span className="text-xs text-gray-400">Confidence: {result.result.confidence}%</span>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.result.level > 70 ? 'bg-red-500' :
                      result.result.level > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${result.result.level}%` }}
                  ></div>
                </div>
                <span className="text-xl font-bold text-white min-w-[3rem]">{result.result.level}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Category:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  result.result.category === 'severe' ? 'bg-red-500/20 text-red-400' :
                  result.result.category === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {result.result.category.toUpperCase()}
                </span>
              </div>
            </div>
            
            {result.result.details && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-red-400 font-bold">{result.result.details.threats}</div>
                  <div className="text-xs text-gray-400">Threats</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-yellow-400 font-bold">{result.result.details.insults}</div>
                  <div className="text-xs text-gray-400">Insults</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <div className="text-orange-400 font-bold">{result.result.details.profanity}</div>
                  <div className="text-xs text-gray-400">Profanity</div>
                </div>
              </div>
            )}
          </div>
        );

      case 'suggest-improvement':
        return (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="text-xs text-red-400 font-semibold mb-2">Original Message:</div>
              <div className="text-red-300">{result.result.original}</div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-green-400 font-semibold mb-2">AI Suggestion:</div>
              <div className="text-green-300 mb-3">{result.result.suggestion}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Tone: {result.result.tone}</span>
                <span className="text-emerald-400 font-semibold">+{result.result.improvement}% better</span>
              </div>
            </div>
            
            {result.result.alternatives && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-gray-400 font-semibold mb-3">Alternative Suggestions:</div>
                <div className="space-y-2">
                  {result.result.alternatives.map((alt: string, index: number) => (
                    <div key={index} className="text-sm text-gray-300 p-2 bg-slate-700/50 rounded">
                      {alt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="text-green-400 font-semibold">
              {result.result.message || 'Operation completed successfully'}
            </div>
            {result.result.timestamp && (
              <div className="text-xs text-gray-400 mt-2">
                Completed at: {new Date(result.result.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/30 border border-slate-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(result.function, result.result)}
          <span className="text-white font-semibold capitalize">
            {result.function.replace('-', ' ')}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{result.timestamp.toLocaleTimeString()}</span>
        </div>
      </div>
      
      {getResultContent()}
    </motion.div>
  );
};

export default ResultDisplay;