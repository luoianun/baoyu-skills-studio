import { Spinner } from './Spinner'

interface GenerateBarProps {
  credits: number
  isLoading: boolean
  onGenerate: () => void
  creditCost?: number
}
export function GenerateBar({ credits, isLoading, onGenerate, creditCost = 1 }: GenerateBarProps) {
  const insufficient = credits < creditCost
  return (
    <div className="bg-white border-t border-surface-variant px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-5">
      {insufficient && (
        <p className="text-xs text-error mb-2">积分不足，请联系管理员。</p>
      )}
      <button
        type="button"
        onClick={onGenerate}
        disabled={isLoading || insufficient}
        className="w-full min-h-11 flex items-center justify-center gap-2 bg-primary text-white rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors">
        {isLoading
          ? <><Spinner size="sm" /><span>生成中...</span></>
          : <><span className="material-symbols-outlined text-base">auto_awesome</span> 生成 · {creditCost} 积分</>
        }
      </button>
      <p className="text-xs text-on-surface-variant text-center mt-1.5">
        剩余 {credits} 积分
      </p>
    </div>
  )
}
