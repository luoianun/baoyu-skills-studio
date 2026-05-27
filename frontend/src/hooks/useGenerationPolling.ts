import { useState, useRef, useCallback } from 'react'
import { portfolioApi } from '../api/portfolios'

export interface PollResult {
  images: { url: string; filename: string }[]
  portfolioId: string
}

export function useGenerationPolling() {
  const [polling, setPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPolling(false)
  }, [])

  const startPolling = useCallback((
    portfolioId: string,
    onSuccess: (result: PollResult) => void,
    onError: (msg: string) => void,
    maxAttempts = 60
  ) => {
    setPolling(true)
    let attempts = 0

    intervalRef.current = setInterval(async () => {
      attempts++
      try {
        const portfolio = await portfolioApi.get(portfolioId)

        if (portfolio.status === 'success') {
          stopPolling()
          const images = (portfolio.image_paths || []).map((p: string) => ({
            url: `/output/${p}`,
            filename: p.split('/').pop() || p,
          }))
          onSuccess({ images, portfolioId })
        } else if (portfolio.status === 'failed') {
          stopPolling()
          onError(portfolio.error_msg || '生成失败，请稍后重试。')
        } else if (attempts >= maxAttempts) {
          stopPolling()
          onError('生成超时，请刷新页面查看结果。')
        }
      } catch {
        stopPolling()
        onError('查询生成状态失败，请稍后重试。')
      }
    }, 2000)
  }, [stopPolling])

  return { polling, startPolling, stopPolling }
}
