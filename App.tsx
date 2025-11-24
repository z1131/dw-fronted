import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkflowNode } from './components/WorkflowNode';
import { TopicSelectionView } from './views/TopicSelectionView';
import { OutlineView } from './views/OutlineView';
import { RefinementView } from './views/RefinementView';
import { PaperTask, WorkflowStep } from './types';
import { Check, Loader2, ArrowLeft } from 'lucide-react';

const INITIAL_TASK: PaperTask = {
  id: 'task-1',
  title: '未命名论文',
  currentStep: WorkflowStep.TOPIC_SELECTION,
  outline: [],
  images: []
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<PaperTask[]>([INITIAL_TASK]);
  const [activeTaskId, setActiveTaskId] = useState<string>('task-1');
  const [isOverviewMode, setIsOverviewMode] = useState(true);

  const activeTask = tasks.find(t => t.id === activeTaskId) || tasks[0];

  useEffect(() => {
    // When switching tasks, revert to overview mode
    setIsOverviewMode(true);
  }, [activeTaskId]);

  const updateTask = (id: string, updates: Partial<PaperTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addTask = () => {
    const newTask: PaperTask = {
      id: `task-${Date.now()}`,
      title: '新建未命名论文',
      currentStep: WorkflowStep.TOPIC_SELECTION,
      outline: [],
      images: []
    };
    setTasks([...tasks, newTask]);
    setActiveTaskId(newTask.id);
  };

  const handleStepClick = (step: WorkflowStep) => {
    if (step <= activeTask.currentStep) {
        setIsOverviewMode(false);
        updateTask(activeTask.id, { currentStep: step });
    }
  };

  const advanceStep = () => {
    const nextStep = activeTask.currentStep + 1;
    if (nextStep <= 4) {
      updateTask(activeTask.id, { currentStep: nextStep });
      setIsOverviewMode(false);
    }
  };

  // Smart Back Navigation
  const handleBack = () => {
    if (activeTask.currentStep === WorkflowStep.TOPIC_SELECTION) {
        // If viewing a selected topic details, go back to generated list/form
        if (activeTask.selectedTopic) {
             updateTask(activeTask.id, { selectedTopic: undefined });
             return;
        }
        // If in a specific mode (New/Existing) but not finalized, go back to mode selection cards
        if (activeTask.topicMode) {
             updateTask(activeTask.id, { topicMode: undefined });
             return;
        }
    }
    // Default: Go back to workflow overview
    setIsOverviewMode(true);
  };

  const getBackLabel = () => {
    if (activeTask.currentStep === WorkflowStep.TOPIC_SELECTION) {
         if (activeTask.selectedTopic) return "返回列表";
         if (activeTask.topicMode) return "返回选题方式";
    }
    return "返回流程图";
  };

  // Render content based on current workflow step
  const renderContent = () => {
    switch (activeTask.currentStep) {
      case WorkflowStep.TOPIC_SELECTION:
        return (
          <TopicSelectionView 
            task={activeTask} 
            onUpdateTask={(u) => updateTask(activeTask.id, u)}
            onComplete={advanceStep}
          />
        );
      case WorkflowStep.OUTLINE_OVERVIEW:
        return (
          <OutlineView
            task={activeTask}
            mode="outline"
            onUpdateTask={(u) => updateTask(activeTask.id, u)}
            onComplete={advanceStep}
          />
        );
      case WorkflowStep.DRAFTING:
        return (
             <OutlineView
                task={activeTask}
                mode="drafting"
                onUpdateTask={(u) => updateTask(activeTask.id, u)}
                onComplete={advanceStep}
            />
        );
      case WorkflowStep.REFINEMENT:
        return <RefinementView task={activeTask} />;
      default:
        return <div>未知步骤</div>;
    }
  };

  const renderWorkflowMap = () => {
    const steps = [
        { id: WorkflowStep.TOPIC_SELECTION, label: "选题" },
        { id: WorkflowStep.OUTLINE_OVERVIEW, label: "大纲及概述" },
        { id: WorkflowStep.DRAFTING, label: "文本内容撰写" },
        { id: WorkflowStep.REFINEMENT, label: "精修" }
    ];

    return (
        <div className="h-full flex items-center justify-center bg-[#f6f8fa] overflow-auto">
            <div className="flex items-center min-w-max p-10">
                {steps.map((step, idx) => {
                    const isActive = activeTask.currentStep === step.id;
                    const isCompleted = activeTask.currentStep > step.id;
                    const isLocked = activeTask.currentStep < step.id;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Card Node */}
                            <div 
                                onClick={() => !isLocked && handleStepClick(step.id)}
                                className={`
                                    w-60 h-16 bg-white border rounded-md flex items-center justify-between px-4 py-2 transition-all duration-200
                                    ${isActive 
                                        ? 'border-blue-500 border-dashed ring-2 ring-blue-50/50 shadow-sm z-10' 
                                        : isCompleted 
                                            ? 'border-green-500/30 hover:border-green-500 shadow-sm' 
                                            : 'border-gray-200 opacity-60 bg-gray-50/50'}
                                    ${!isLocked ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed'}
                                `}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    {/* Icon State */}
                                    <div className="shrink-0">
                                        {isCompleted ? (
                                            <div className="w-5 h-5 rounded-full bg-[#1a7f37] flex items-center justify-center text-white">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        ) : isActive ? (
                                            <Loader2 className="text-[#0969da] animate-spin" size={20} strokeWidth={2.5} />
                                        ) : (
                                            <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className={`font-semibold text-sm truncate ${isCompleted || isActive ? 'text-[#1f2328]' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {idx < steps.length - 1 && (
                                <div className="flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#d0d7de] -mr-0.5 z-0 relative"></div>
                                    <div className="w-12 h-0.5 bg-[#d0d7de]"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#d0d7de] -ml-0.5 z-0 relative"></div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-slate-800 font-sans">
      <Sidebar 
        tasks={tasks} 
        activeTaskId={activeTaskId} 
        onSelectTask={setActiveTaskId} 
        onAddTask={addTask}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation - Only show if not in overview mode */}
        {!isOverviewMode && (
             <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm justify-between z-10 animate-fade-in-down">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleBack}
                        className="text-gray-500 hover:text-blue-600 font-medium text-sm flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        {getBackLabel()}
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-2"></div>
                    <h2 className="font-bold text-gray-800 truncate max-w-xs">{activeTask.title}</h2>
                </div>
                
                <div className="flex items-center space-x-2">
                    <WorkflowNode step={WorkflowStep.TOPIC_SELECTION} currentStep={activeTask.currentStep} label="选题" stepNumber={1} onClick={handleStepClick} />
                    <WorkflowNode step={WorkflowStep.OUTLINE_OVERVIEW} currentStep={activeTask.currentStep} label="大纲" stepNumber={2} onClick={handleStepClick} />
                    <WorkflowNode step={WorkflowStep.DRAFTING} currentStep={activeTask.currentStep} label="撰写" stepNumber={3} onClick={handleStepClick} />
                    <WorkflowNode step={WorkflowStep.REFINEMENT} currentStep={activeTask.currentStep} label="精修" stepNumber={4} onClick={handleStepClick} />
                </div>
            </div>
        )}

        {/* Main Workspace */}
        <div className="flex-1 overflow-hidden relative bg-[#f6f8fa]">
            {isOverviewMode ? renderWorkflowMap() : renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;