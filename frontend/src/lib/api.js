import axios from 'axios'
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api')
export const api = axios.create({ baseURL })
api.interceptors.request.use((config) => { const token = localStorage.getItem('smartbite_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
export const errorMessage = (error) => error.response?.data?.message || 'Unable to complete that action. Please try again.'
