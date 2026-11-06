import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'
const AuthContext = createContext(null)
export function AuthProvider({ children }) { const [user, setUser] = useState(null); const [ngoProfile, setNgoProfile] = useState(null); const [loading, setLoading] = useState(true)
  const refresh = async () => { try { const { data } = await api.get('/auth/me'); setUser(data.data.user); setNgoProfile(data.data.ngoProfile) } catch { localStorage.removeItem('smartbite_token'); setUser(null); setNgoProfile(null) } finally { setLoading(false) } }
  useEffect(() => { refresh() }, [])
  const login = async (values) => { const { data } = await api.post('/auth/login', values); localStorage.setItem('smartbite_token', data.data.token); setUser(data.data.user); await refresh(); return data }
  const register = async (values) => { const { data } = await api.post('/auth/register', values); localStorage.setItem('smartbite_token', data.data.token); setUser(data.data.user); await refresh(); return data }
  const logout = () => { localStorage.removeItem('smartbite_token'); setUser(null); setNgoProfile(null) }
  return <AuthContext.Provider value={{ user, ngoProfile, loading, login, register, logout, refresh }}>{children}</AuthContext.Provider> }
export const useAuth = () => useContext(AuthContext)
