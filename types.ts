export enum WorkflowStep {
  TOPIC_SELECTION = 1,
  OUTLINE_OVERVIEW = 2,
  DRAFTING = 3,
  REFINEMENT = 4
}

export interface Annotation {
  id: string;
  targetId: string; // ID of the section or outline item
  text: string; // The selected text or context
  comment: string; // The user's or AI's comment
  type: 'user' | 'ai';
  status: 'open' | 'resolved';
}

export interface Topic {
  id: string;
  title: string;
  overview: string;
  fullDetail?: string;
}

export interface PaperTask {
  id: string;
  title: string;
  currentStep: WorkflowStep;
  
  // Step 1 Data
  topicMode?: 'existing' | 'new';
  selectedTopic?: Topic;
  topicPrompt?: string; // For "existing" mode analysis

  // Step 2 & 3 Data
  outline: {
    id: string;
    title: string;
    content: string; // The overview or draft content
  }[];
  
  // Step 4 Data
  refinementSuggestions?: Annotation[];

  // Image Assets (Nano Banana features)
  images: GeneratedImage[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  params?: string;
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
