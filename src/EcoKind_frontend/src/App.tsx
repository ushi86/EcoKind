import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import ProjectDashboard from './components/ProjectDashboard';
import AuthenticationPage from './components/AuthenticationPage';
import MainWorkspace from './components/MainWorkspace';
import { AppState, Project } from './types';

// ============================================================================
// BACKEND INTEGRATION GUIDE:
// ============================================================================
// 1. Replace mock data with your actual backend calls
// 2. Update the API endpoints in each component
// 3. Add your Internet Identity integration
// 4. Connect VetKey authentication
// 5. Replace mock functions with actual backend functions
// ============================================================================

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [principalId, setPrincipalId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [authKey, setAuthKey] = useState<string>('');
  
  // TODO: Replace with actual backend data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Gaming Community Shield',
      description: 'Advanced toxicity protection for gaming platforms with real-time moderation',
      createdAt: new Date('2024-01-15'),
      authKey: 'vetkey-auth-gaming-2024'
    },
    {
      id: '2',
      name: 'Social Media Guardian',
      description: 'Comprehensive content filtering for social media platforms',
      createdAt: new Date('2024-01-10'),
      authKey: 'vetkey-auth-social-2024'
    }
  ]);

  // ========================================
  // BACKEND INTEGRATION POINT #1
  // Replace with actual Internet Identity
  // ========================================
  const handleIdentityConnect = async (principal: string) => {
    try {
      // TODO: Add your Internet Identity integration here
      // const identity = await window.ic.plug.requestConnect();
      // const principal = identity.principalId;
      
      setPrincipalId(principal);
      setAppState('dashboard');
    } catch (error) {
      console.error('Identity connection failed:', error);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setAppState('authentication');
  };

  // ========================================
  // BACKEND INTEGRATION POINT #2
  // Replace with actual project creation API
  // ========================================
  const handleProjectCreate = async (project: Omit<Project, 'id' | 'createdAt' | 'authKey'>) => {
    try {
      // TODO: Add your backend project creation API call
      // const response = await fetch('/api/projects', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...project, principalId })
      // });
      // const newProject = await response.json();
      
      const newProject: Project = {
        ...project,
        id: Date.now().toString(),
        createdAt: new Date(),
        authKey: `vetkey-${Math.random().toString(36).substr(2, 12)}`
      };
      
      setProjects(prev => [...prev, newProject]);
    } catch (error) {
      console.error('Project creation failed:', error);
    }
  };

  // ========================================
  // BACKEND INTEGRATION POINT #3
  // Replace with actual VetKey authentication
  // ========================================
  const handleAuthentication = async (key: string) => {
    try {
      // TODO: Add your VetKey authentication here
      // const isValid = await vetKeyValidate(selectedProject.id, key);
      
      if (selectedProject && key === selectedProject.authKey) {
        setAuthKey(key);
        setAppState('workspace');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setAuthKey('');
    setAppState('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatePresence mode="wait">
        {appState === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LandingPage onIdentityConnect={handleIdentityConnect} />
          </motion.div>
        )}

        {appState === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
          >
            <ProjectDashboard
              principalId={principalId}
              projects={projects}
              onProjectSelect={handleProjectSelect}
              onProjectCreate={handleProjectCreate}
            />
          </motion.div>
        )}

        {appState === 'authentication' && selectedProject && (
          <motion.div
            key="authentication"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <AuthenticationPage
              project={selectedProject}
              onAuthenticate={handleAuthentication}
              onBack={handleBackToDashboard}
            />
          </motion.div>
        )}

        {appState === 'workspace' && selectedProject && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            <MainWorkspace
              project={selectedProject}
              principalId={principalId}
              onBack={handleBackToDashboard}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;