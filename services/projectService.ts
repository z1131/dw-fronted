import axios from 'axios';

// Nginx will proxy /api to backend gateway
const API_BASE_URL = '/api/core/v1';

export interface ProjectDTO {
  id: number;
  userId: number;
  title: string | null;
  status: string;
  createdAt: string;
}

export const projectService = {
  async createProject(): Promise<ProjectDTO> {
    try {
      const response = await axios.post(`${API_BASE_URL}/projects`);
      if (response.data && response.data.code === 200) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Create project failed');
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getProject(id: string): Promise<ProjectDTO> {
    const response = await axios.get(`${API_BASE_URL}/projects/${id}`);
    return response.data.data;
  },

  async listProjects(userId?: number): Promise<ProjectDTO[]> {
    try {
      const url = userId
        ? `${API_BASE_URL}/projects?userId=${userId}`
        : `${API_BASE_URL}/projects`;
      const response = await axios.get(url);
      if (response.data && response.data.code === 200) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'List projects failed');
    } catch (error) {
      console.error("API Error:", error);
      return []; // Return empty array on error to prevent crashes
    }
  }
};
