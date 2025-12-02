import { create } from 'zustand';
import { PaperTask, WorkflowStep } from '../types';

interface ProjectStore {
  task: PaperTask;
  setTask: (updates: Partial<PaperTask>) => void;
  updateStep: (step: WorkflowStep) => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const INITIAL_TASK: PaperTask = {
  id: '',
  title: 'New Paper Project',
  currentStep: WorkflowStep.TOPIC_SELECTION,
  topicMode: 'new',
  outline: [],
  images: []
};

export const useProjectStore = create<ProjectStore>((set) => ({
  task: INITIAL_TASK,
  isLoading: false,
  
  setTask: (updates) => set((state) => ({ 
    task: { ...state.task, ...updates } 
  })),
  
  updateStep: (step) => set((state) => ({
    task: { ...state.task, currentStep: step }
  })),

  setLoading: (loading) => set({ isLoading: loading })
}));
