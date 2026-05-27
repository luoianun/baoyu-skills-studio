import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { generateApi } from '../../api/generate'
import { useGenerationPolling } from '../../hooks/useGenerationPolling'
import { FormPanel } from '../../components/studio/FormPanel'
import { FormField } from '../../components/studio/FormField'
import { ChipGroup } from '../../components/studio/ChipGroup'
import { GenerateBar } from '../../components/studio/GenerateBar'
import { ResultsPanel } from '../../components/studio/ResultsPanel'

const ILLUSTRATION_TYPES = [
  { value: 'infographic', label: '数据信息图' },
  { value: 'scene', label: '场景叙事图' },
  { value: 'flowchart', label: '流程图' },
  { value: 'comparison', label: '对比图' },
  { value: 'framework', label: '架构框架图' },
  { value: 'timeline', label: '时间线演化图' },
  { value: 'mixed', label: '混合' },
]

const STYLES = [
  { value: 'notion', label: 'Notion风格' },
  { value: 'warm', label: '自然有机' },
  { value: 'minimal', label: '极简留白' },
  { value: 'blueprint', label: '技术蓝图' },
  { value: 'sketch', label: '铅笔素描' },
  { value: 'editorial', label: '编辑杂志' },
]

const DENSITIES = [
  { value: 'minimal', label: '极简' },
  { value: 'balanced', label: '均衡' },
  { value: 'per-section', label: '按段落' },
  { value: 'rich', label: '丰富' },
]

const LANGUAGES = [
  { value: 'auto', label: '自动' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'ja', label: '日文' },
]

const EXAMPLE_PROMPTS = [
  {
    label: '知识库检索原理',
    content: `什么是检索增强生成？为什么它让问答更准确\n\n检索增强生成 = 让系统在回答前先去"查资料"\n\n传统问答系统的问题：\n- 知识截止到训练/更新日期\n- 无法访问私有数据\n- 容易给出过时或不准确的答案\n\n检索增强的工作原理：\n1. 用户提问\n2. 系统从知识库中检索相关文档\n3. 将文档作为上下文附加给问答模块\n4. 系统基于真实资料生成答案\n\n应用场景：企业知识库问答、法律文书检索、医疗诊断辅助`,
  },
  {
    label: '微服务架构',
    content: `微服务 vs 单体架构：什么时候该拆分？\n\n单体架构\n- 所有模块在一个代码库\n- 部署简单，适合早期产品\n- 团队规模小时效率高\n- 问题：随规模增大，部署风险高、难以扩展\n\n微服务架构\n- 每个业务模块独立部署\n- 技术栈可以不同\n- 故障隔离，一个服务挂了不影响全局\n- 问题：运维复杂度高，需要服务发现、链路追踪等基础设施\n\n拆分时机：团队超过50人、日活超过100万、或某个模块明显成为瓶颈`,
  },
  {
    label: '产品增长策略',
    content: `从0到1：早期产品的3种增长引擎\n\n病毒式增长（Viral Growth）\n原理：用户使用产品时自然带来新用户\n案例：Dropbox邀请好友获得额外空间\n适合：社交、协作类产品\n\n内容增长（Content Growth）\n原理：通过SEO、内容营销积累自然流量\n案例：Notion的模板库吸引大量搜索流量\n适合：工具类、知识类产品\n\n销售驱动增长（Sales-led Growth）\n原理：主动触达目标客户，人工转化\n适合：企业级产品、高客单价\n\n建议：先找到一个核心增长引擎，集中资源做到极致`,
  },
  {
    label: 'Docker入门',
    content: `Docker核心概念：镜像、容器、仓库\n\n为什么需要Docker？\n"在我电脑上能跑"的问题从此消失——Docker让应用和运行环境打包在一起。\n\n三个核心概念：\n\n镜像（Image）\n只读模板，包含运行应用所需的一切：代码、运行时、依赖库\n类比：饺子的配方\n\n容器（Container）\n镜像运行后的实例，可以启动、停止、删除\n类比：按配方包出来的饺子\n\n仓库（Registry）\n存放镜像的地方，Docker Hub是最大的公共仓库\n类比：菜谱书店`,
  },
]

export default function ArticleIllustratorPage() {
  const [content, setContent] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [type, setType] = useState('infographic')
  const [style, setStyle] = useState('notion')
  const [density, setDensity] = useState('balanced')
  const [lang, setLang] = useState('auto')

  const DENSITY_COST: Record<string, number> = { minimal: 2, balanced: 4, 'per-section': 3, rich: 6 }
  const creditCost = DENSITY_COST[density] ?? 3

  const [images, setImages] = useState<{ url: string; filename: string }[]>([])
  const [portfolioId, setPortfolioId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { user, updateCredits } = useAuthStore()
  const navigate = useNavigate()
  const { startPolling } = useGenerationPolling()

  const handleGenerate = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await generateApi.articleIllustrator({ content, type, style, density, lang })
      setPortfolioId(result.portfolio_id)
      const deduct = result.image_count ?? creditCost
      startPolling(
        result.portfolio_id,
        ({ images }) => {
          setImages(images)
          setLoading(false)
          const currentCredits = useAuthStore.getState().user?.credits ?? 0
          updateCredits(currentCredits - deduct)
        },
        (msg) => {
          setError(msg)
          setLoading(false)
        }
      )
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } }
      setError(e.response?.status === 402 ? '积分不足，请联系管理员充值。' : '生成失败，请稍后重试。')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:h-full">
      <FormPanel title="文章配图" description="为你的文章生成配套插图。" footer={<GenerateBar credits={user?.credits ?? 0} isLoading={loading} onGenerate={handleGenerate} creditCost={creditCost} />}>
        <FormField label="内容">
          <textarea
            rows={4}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
            placeholder="粘贴文章标题或内容..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowExamples(v => !v)}
            className="mt-1.5 flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">lightbulb</span>
            示例内容
            <span className="material-symbols-outlined text-[14px]">{showExamples ? 'expand_less' : 'expand_more'}</span>
          </button>
          {showExamples && (
            <div className="mt-1.5 flex flex-col gap-1.5">
              {EXAMPLE_PROMPTS.map(ex => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => { setContent(ex.content); setShowExamples(false) }}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-outline-variant bg-surface hover:bg-primary/5 hover:border-primary/40 transition-colors"
                >
                  <span className="font-medium text-on-surface">{ex.label}</span>
                  <span className="text-on-surface-variant ml-1 line-clamp-1">{ex.content.split('\n')[0]}</span>
                </button>
              ))}
            </div>
          )}
        </FormField>
        <FormField label="插图类型">
          <ChipGroup options={ILLUSTRATION_TYPES} value={type} onChange={setType} />
        </FormField>
        <FormField label="风格">
          <ChipGroup options={STYLES} value={style} onChange={setStyle} />
        </FormField>
        <FormField label="密度">
          <ChipGroup options={DENSITIES} value={density} onChange={setDensity} />
        </FormField>
        <FormField label="语言">
          <ChipGroup options={LANGUAGES} value={lang} onChange={setLang} />
        </FormField>
      </FormPanel>

      <div className="flex-1 min-w-0 flex flex-col">
        {portfolioId && !loading && (
          <div className="px-4 py-3 sm:px-6 bg-white border-b border-surface-variant flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-on-surface-variant">生成完成</p>
            <button
              onClick={() => navigate(`/portfolios/${portfolioId}`)}
              className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
            >
              查看作品集 <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        )}
        {error && (
          <div className="px-4 py-2 sm:px-6 bg-red-50 border-b border-red-100">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}
        <ResultsPanel images={images} isLoading={loading} columns={2} />
      </div>
    </div>
  )
}
