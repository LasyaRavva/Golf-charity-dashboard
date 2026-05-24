import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { setApiTokenGetter } from '../services/api'

export const AuthContext = createContext(null)

const TOKEN_KEY = 'golf_auth_token'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setApiTokenGetter(async () => token || null)
  }, [token])

  const persistToken = (nextToken) => {
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken)
    else localStorage.removeItem(TOKEN_KEY)
    setToken(nextToken || '')
  }

  const refreshUser = async () => {
    const res = await api.get('/auth/me')
    setUser(res.data.user)
    return res.data.user
  }

  const setSession = async (nextToken, nextUser = null) => {
    persistToken(nextToken)

    if (nextUser) {
      setUser(nextUser)
      return nextUser
    }

    return refreshUser()
  }

  const logout = () => {
    persistToken('')
    setUser(null)
  }

  useEffect(() => {
    let cancelled = false

    const loadUser = async () => {
      if (!token) {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
        return
      }

      try {
        const nextUser = await api.get('/auth/me')
        if (!cancelled) setUser(nextUser.data.user)
      } catch {
        if (!cancelled) {
          persistToken('')
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    setLoading(true)
    loadUser()

    return () => {
      cancelled = true
    }
  }, [token])

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    refreshUser,
    setSession,
    logout
  }), [loading, token, user])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
