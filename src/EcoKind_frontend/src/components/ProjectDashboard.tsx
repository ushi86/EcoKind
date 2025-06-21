import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Shield, User, LogOut, Folder, Settings, Sparkles, Activity } from 'lucide-react';
import { Project } from '../types';

interface ProjectDashboardProps {
  principalId: string;
  projects: Project[];
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (project: Omit<Project, 'id' | 'createdAt' | 'authKey'>) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  principalId,
  projects,
  onProjectSelect,
  onProjectCreate
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  // ========================================
  // BACKEND INTEGRATION POINT #4
  // Replace with actual project creation API
  // ========================================
  const handleCreateProject = async () => {
    if (newProject.name.trim() && newProject.description.trim()) {
      try {
        // TODO: Add your backend project creation API call
        // const response = await fetch('/api/projects', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ ...newProject, principalId })
        // });
        // const createdProject = await response.json();
        
        onProjectCreate(newProject);
        setNewProject({ name: '', description: '' });
        setShowCreateModal(false);
      } catch (error) {
        console.error('Project creation failed:', error);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrincipalId = (id: string) => {
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">EcoKind Dashboard</h1>
                <p className="text-sm text-gray-400 font-mono">Project Management Console</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                <User className="w-4 h-4 text-emerald-400" />
                <div className="text-right">
                  <div className="text-white text-sm font-medium">Connected</div>
                  <div className="text-gray-400 text-xs font-mono">{formatPrincipalId(principalId)}</div>
                </div>
              </div>
              
              <button className="p-3 hover:bg-white/10 rounded-xl transition-colors duration-200 group">
                <Settings className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              </button>
              
              <button className="p-3 hover:bg-white/10 rounded-xl transition-colors duration-200 group">
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-4xl font-bold text-white mb-3">Welcome back!</h2>
          <p className="text-gray-400 text-lg">Manage your AI-powered toxicity detection projects and monitor community health.</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Projects</p>
                <p className="text-3xl font-bold text-white mt-1">{projects.length}</p>
                <p className="text-emerald-400 text-xs mt-1">+2 this month</p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Folder className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Messages Filtered</p>
                <p className="text-3xl font-bold text-white mt-1">24,847</p>
                <p className="text-cyan-400 text-xs mt-1">+1.2k today</p>
              </div>
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Detection Rate</p>
                <p className="text-3xl font-bold text-white mt-1">96.8%</p>
                <p className="text-purple-400 text-xs mt-1">+0.3% improvement</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Projects Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Your Projects</h3>
            <p className="text-gray-400">Manage and monitor your toxicity detection systems</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </motion.button>
        </div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-500 cursor-pointer group"
              onClick={() => onProjectSelect(project)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <Shield className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors duration-300">
                {project.name}
              </h4>
              
              <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">
                {project.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Active</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500 font-mono">
                  <Sparkles className="w-3 h-3" />
                  <span>ID: {project.id}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-white/5 rounded-2xl flex items-center justify-center">
              <Folder className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">No projects yet</h4>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Create your first project to start protecting your community with AI-powered toxicity detection</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-white font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg"
            >
              Create First Project
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Plus className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Create New Project</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200"
                    placeholder="Enter a descriptive project name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition-all duration-200 resize-none"
                    placeholder="Describe your project's purpose and target community"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all duration-200 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProject.name.trim() || !newProject.description.trim()}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Create Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDashboard;