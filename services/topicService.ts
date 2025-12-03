import axios from 'axios';

// API Base URL
const API_BASE_URL = '/api/core/v1';

export interface TopicCandidate {
    title: string;
    overview: string;
    rationale?: string;
}

export interface GenerateTopicRequest {
    initialIdea: string;
}

export interface ConfirmTopicRequest {
    title: string;
    candidateId?: number;
}

export const topicService = {
    /**
     * Generate topic candidates via Backend -> DeepSeek
     */
    async generateTopics(projectId: number, initialIdea: string): Promise<TopicCandidate[]> {
        try {
            const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/topics/generate`, {
                initialIdea
            });

            if (response.data && response.data.code === 200) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Topic generation failed');
        } catch (error) {
            console.error("Topic Generation Error:", error);
            throw error;
        }
    },

    /**
     * Confirm a selected topic
     */
    async analyzeTopic(projectId: number, file: File, topicTitle: string): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('topicTitle', topicTitle);

        try {
            const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/topics/analyze`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error analyzing topic:', error);
            throw error;
        }
    },

    async confirmTopic(projectId: number, title: string, candidateId?: number): Promise<boolean> {
        try {
            const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/topics/confirm`, {
                title,
                candidateId
            });

            if (response.data && response.data.code === 200) {
                return true;
            }
            throw new Error(response.data.message || 'Topic confirmation failed');
        } catch (error) {
            console.error("Topic Confirmation Error:", error);
            throw error;
        }
    }
};
