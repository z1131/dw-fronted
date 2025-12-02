import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '../stores/useProjectStore';
import { WorkflowStep } from '../types';
import { 
  PenTool, ListTree, FileText, Sparkles, ImageIcon, Menu 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { task } = useProjectStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleStepClick = (step: WorkflowStep) => {
    switch (step) {
      case WorkflowStep.TOPIC_SELECTION:
        navigate('/workspace/topic');
        break;
      case WorkflowStep.OUTLINE_OVERVIEW:
        // Only allow navigation if we reached this step
        if (task.currentStep >= WorkflowStep.OUTLINE_OVERVIEW) navigate('/workspace/outline');
        break;
      case WorkflowStep.DRAFTING:
        if (task.currentStep >= WorkflowStep.DRAFTING) navigate('/workspace/drafting');
        break;
      case WorkflowStep.REFINEMENT:
        if (task.currentStep >= WorkflowStep.REFINEMENT) navigate('/workspace/refinement');
        break;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r flex flex-col`}>
        <div className="p-4 border-b flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">DW</div>
          <span className="font-bold text-xl text-gray-800 overflow-hidden whitespace-nowrap">DeepWrite</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Workspace
          </div>
          <nav className="space-y-1 px-2">
            <div className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-blue-50 text-blue-700 transition-colors">
              <PenTool size={18} />
              <span className="font-medium">Writing Assistant</span>
            </div>
          </nav>

          <div className="mt-8 px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Paper Progress
          </div>
          <div className="px-6 relative">
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-200"></div>
            <div className="space-y-6 relative">
              {[
                { step: WorkflowStep.TOPIC_SELECTION, label: 'Topic', icon: Sparkles },
                { step: WorkflowStep.OUTLINE_OVERVIEW, label: 'Outline', icon: ListTree },
                { step: WorkflowStep.DRAFTING, label: 'Drafting', icon: FileText },
                { step: WorkflowStep.REFINEMENT, label: 'Refinement', icon: PenTool },
              ].map((item) => (
                <div 
                  key={item.step} 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleStepClick(item.step)}
                >
                  <div className={`relative z-10 w-2 h-2 rounded-full ${
                    task.currentStep >= item.step ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-sm ${
                    task.currentStep === item.step ? 'font-bold text-blue-700' : 
                    task.currentStep > item.step ? 'font-medium text-gray-700' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{task.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">U</div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-5xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
