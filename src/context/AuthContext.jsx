import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { user } = await api('/auth/me')
      setUser(user)
    } catch (err) {
      setUser(null)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Any 401 from the API means the session expired: drop the user so guarded pages redirect to login
  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener('pulsefit:unauthorized', onUnauthorized)
    return () => window.removeEventListener('pulsefit:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (email, password) => {
    const { user } = await api('/auth/login', { method: 'POST', body: { email, password } })
    setUser(user)
    setError(null)
    return user
  }, [])

  const signup = useCallback(async (fields) => {
    const { user } = await api('/auth/signup', { method: 'POST', body: fields })
    setUser(user)
    setError(null)
    return user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, refresh, login, signup, logout }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
