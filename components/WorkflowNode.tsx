import React from 'react';
import { WorkflowStep } from '../types';
import { Check, ChevronRight } from 'lucide-react';

interface WorkflowNodeProps {
  step: WorkflowStep;
  currentStep: WorkflowStep;
  label: string;
  stepNumber: number;
  onClick: (step: WorkflowStep) => void;
}

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({ step, currentStep, label, stepNumber, onClick }) => {
  const isActive = currentStep === step;
  const isCompleted = currentStep > step;

  let baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-300";
  
  if (isActive) {
    baseClasses += " bg-blue-600 text-white shadow-lg scale-105";
  } else if (isCompleted) {
    baseClasses += " bg-green-100 text-green-700 border border-green-300 hover:bg-green-200";
  } else {
    baseClasses += " bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200";
  }

  return (
    <div className="flex items-center">
      <div className={baseClasses} onClick={() => isCompleted || isActive ? onClick(step) : null}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-white text-blue-600' : isCompleted ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'}`}>
          {isCompleted ? <Check size={14} /> : stepNumber}
        </div>
        <span className="font-medium text-sm whitespace-nowrap">{label}</span>
      </div>
      {stepNumber < 4 && (
        <ChevronRight className="text-gray-300 mx-2" size={20} />
      )}
    </div>
  );
};