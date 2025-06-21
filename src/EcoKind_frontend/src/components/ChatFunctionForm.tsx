import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2, User, MessageCircle, Hash } from 'lucide-react';

interface ChatFunctionFormProps {
  functionId: string;
  parameters: string[];
  onSubmit: (functionId: string, params: Record<string, string>) => void;
  isLoading: boolean;
}

const ChatFunctionForm: React.FC<ChatFunctionFormProps> = ({
  functionId,
  parameters,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(functionId, formData);
  };

  const getInputType = (param: string) => {
    if (param.toLowerCase().includes('index')) return 'number';
    if (param.toLowerCase().includes('message') || param.toLowerCase().includes('text')) return 'textarea';
    return 'text';
  };

  const getInputIcon = (param: string) => {
    if (param.toLowerCase().includes('address')) return <User className="w-4 h-4" />;
    if (param.toLowerCase().includes('message') || param.toLowerCase().includes('text')) return <MessageCircle className="w-4 h-4" />;
    if (param.toLowerCase().includes('index')) return <Hash className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  const getPlaceholder = (param: string) => {
    const placeholders: Record<string, string> = {
      senderAddress: 'Enter sender\'s principal ID (e.g., rdmx6-jaaaa-aaaah-qcaiq-cai)',
      receiverAddress: 'Enter receiver\'s principal ID (e.g., rdmx6-jaaaa-aaaah-qcaiq-cai)',
      message: 'Type your message here...',
      messageIndex: 'Message index (starts from 0)',
      newMessage: 'Enter the edited message content',
      text: 'Enter text to analyze for toxicity...'
    };
    return placeholders[param] || `Enter ${param.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
  };

  const formatLabel = (param: string) => {
    return param
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {parameters.map((param, index) => (
        <motion.div
          key={param}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-3"
        >
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
            {getInputIcon(param)}
            <span>{formatLabel(param)}</span>
            <span className="text-red-400">*</span>
          </label>
          
          {getInputType(param) === 'textarea' ? (
            <textarea
              value={formData[param] || ''}
              onChange={(e) => setFormData({ ...formData, [param]: e.target.value })}
              placeholder={getPlaceholder(param)}
              rows={4}
              className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 resize-none"
              required
            />
          ) : (
            <input
              type={getInputType(param)}
              value={formData[param] || ''}
              onChange={(e) => setFormData({ ...formData, [param]: e.target.value })}
              placeholder={getPlaceholder(param)}
              className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200"
              required
            />
          )}
        </motion.div>
      ))}

      {parameters.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Play className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-gray-400">This function is ready to execute without additional parameters.</p>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading || (parameters.length > 0 && !parameters.every(param => formData[param]?.trim()))}
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
              <span>Execute Function</span>
            </>
          )}
        </div>
      </motion.button>
    </form>
  );
};

export default ChatFunctionForm;