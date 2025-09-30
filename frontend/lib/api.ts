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
    token: (data: any) => apiClient.post('/auth/token', data),
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
  jobEvents: {
    list: (jobId?: number) => apiClient.get('/job-events/', { params: { job_id: jobId } }),
    get: (id: number) => apiClient.get(`/job-events/${id}`),
    create: (data: any) => apiClient.post('/job-events/', data),
    update: (id: number, data: any) => apiClient.put(`/job-events/${id}`, data),
    delete: (id: number) => apiClient.delete(`/job-events/${id}`),
  },
  shortlists: {
    list: (jobId?: number, studentId?: number) => apiClient.get('/shortlists/', { params: { job_id: jobId, student_id: studentId } }),
    get: (id: number) => apiClient.get(`/shortlists/${id}`),
    create: (data: any) => apiClient.post('/shortlists/', data),
    update: (id: number, data: any) => apiClient.put(`/shortlists/${id}`, data),
    delete: (id: number) => apiClient.delete(`/shortlists/${id}`),
  },
  optOut: {
    list: (status?: string) => apiClient.get('/opt-out/', { params: { status } }),
    get: (id: number) => apiClient.get(`/opt-out/${id}`),
    create: (data: any) => apiClient.post('/opt-out/', data),
    review: (id: number, data: any) => apiClient.put(`/opt-out/${id}/review`, data),
  },
  bulletin: {
    list: (postType?: string, targetAudience?: string) => apiClient.get('/bulletin/', { params: { post_type: postType, target_audience: targetAudience } }),
    get: (id: number) => apiClient.get(`/bulletin/${id}`),
    create: (data: any) => apiClient.post('/bulletin/', data),
    update: (id: number, data: any) => apiClient.put(`/bulletin/${id}`, data),
    delete: (id: number) => apiClient.delete(`/bulletin/${id}`),
  },
  resources: {
    list: (facultyId?: number, resourceType?: string) => apiClient.get('/resources/', { params: { faculty_id: facultyId, resource_type: resourceType } }),
    get: (id: number) => apiClient.get(`/resources/${id}`),
    create: (data: any) => apiClient.post('/resources/', data),
    upload: (file: File, data: any) => {
      const formData = new FormData();
      formData.append('file', file);
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      return apiClient.post('/resources/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    update: (id: number, data: any) => apiClient.put(`/resources/${id}`, data),
    delete: (id: number) => apiClient.delete(`/resources/${id}`),
  },
  courses: {
    list: (facultyId?: number, subject?: string) => apiClient.get('/courses/', { params: { faculty_id: facultyId, subject } }),
    get: (id: number) => apiClient.get(`/courses/${id}`),
    create: (data: any) => apiClient.post('/courses/', data),
    update: (id: number, data: any) => apiClient.put(`/courses/${id}`, data),
    delete: (id: number) => apiClient.delete(`/courses/${id}`),
    register: (id: number) => apiClient.post(`/courses/${id}/register`),
    unregister: (id: number) => apiClient.delete(`/courses/${id}/unregister`),
    getRegistrations: (id: number) => apiClient.get(`/courses/${id}/registrations`),
  },
  notifications: {
    list: (isRead?: boolean) => apiClient.get('/notifications/', { params: { is_read: isRead } }),
    get: (id: number) => apiClient.get(`/notifications/${id}`),
    create: (data: any) => apiClient.post('/notifications/', data),
    markAsRead: (id: number) => apiClient.put(`/notifications/${id}/read`),
    markAllAsRead: () => apiClient.put('/notifications/read-all'),
    delete: (id: number) => apiClient.delete(`/notifications/${id}`),
    getUnreadCount: () => apiClient.get('/notifications/stats/unread'),
  },
};