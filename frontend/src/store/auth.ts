import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User { id: number; email: string; username: string; role: string; credits: number }
interface AuthStore {
  user: User | null
  setUser: (u: User) => void
  updateCredits: (credits: number) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateCredits: (credits) => set((s) => s.user ? { user: { ...s.user, credits } } : {}),
      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null })
      },
    }),
    { name: 'auth-store' }
  )
)
