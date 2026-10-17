import { create } from 'zustand'

import { login as apiLogin } from '../api/auth'
import { UserInfo } from '../types'
import { clearToken, getToken } from '../utils/token'

interface UserState {
  user: UserInfo | null
  loading: boolean
  isLoggedIn: boolean
  login: () => Promise<void>
  logout: () => void
  setUser: (user: UserInfo) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  isLoggedIn: !!getToken(),

  login: async () => {
    set({ loading: true })
    try {
      const data = await apiLogin()
      set({
        user: data.user,
        isLoggedIn: true,
        loading: false,
      })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  logout: () => {
    clearToken()
    set({ user: null, isLoggedIn: false })
  },

  setUser: (user) => set({ user }),
}))
