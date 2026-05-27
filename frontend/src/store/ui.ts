import { create } from 'zustand'

interface UIStore {
  portfolioModule: string
  setPortfolioModule: (m: string) => void
  clearPortfolioModule: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  portfolioModule: '',
  setPortfolioModule: (portfolioModule) => set({ portfolioModule }),
  clearPortfolioModule: () => set({ portfolioModule: '' }),
}))
