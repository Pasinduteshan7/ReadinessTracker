import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8001',
  timeout: 120000,  // Gemini calls can take 20-30s
})

export const api = {
  // List all students (leaderboard)
  getStudents: () => API.get('/api/leaderboard').then(r => r.data),

  // Get one student's full detail
  getStudent: (id) => API.get(`/api/students/${id}`).then(r => r.data),

  // Get student ranking (percentile)
  getRanking: (id) => API.get(`/api/students/${id}/ranking`).then(r => r.data),

  // Cohort stats
  getCohortStats: () => API.get('/api/cohort-stats').then(r => r.data),

  // Upload PDF for analysis
  analyzePdf: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return API.post('/api/analyze', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
}