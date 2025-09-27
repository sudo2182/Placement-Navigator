import axios from 'axios';

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-domain.com'
  : 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  auth: {
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),
  },
  jobs: {
    list: () => apiClient.get('/jobs/'),
    get: (id: number) => apiClient.get(`/jobs/${id}`),
    create: (data: any) => apiClient.post('/jobs/', data),
    apply: (id: number, data: any) => apiClient.post(`/jobs/${id}/apply`, data),
    getMatches: (id: number) => apiClient.get(`/jobs/${id}/matches`),
    triggerMatching: (id: number) => apiClient.post(`/jobs/${id}/find-matches`),
  },
  analytics: {
    getProgress: () => apiClient.get('/analytics/student/progress'),
    getRecommendations: () => apiClient.get('/analytics/student/recommendations'),
    getSkillGaps: () => apiClient.get('/analytics/student/skill-gaps'),
    getStudentProgress: (studentId: number) => apiClient.get(`/analytics/student/${studentId}/progress`),
  },
};