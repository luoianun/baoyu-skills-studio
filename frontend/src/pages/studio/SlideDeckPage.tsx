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

const STYLES = [
  { value: 'blueprint', label: '技术蓝图' },
  { value: 'chalkboard', label: '黑板课堂' },
  { value: 'corporate', label: '商务正式' },
  { value: 'minimal', label: '极简留白' },
  { value: 'gradient', label: '水彩温柔' },
  { value: 'dark', label: '暗调氛围' },
  { value: 'colorful', label: '大胆编辑' },
]

const AUDIENCES = [
  { value: 'beginners', label: '初学者' },
  { value: 'intermediate', label: '进阶' },
  { value: 'experts', label: '专家' },
  { value: 'executives', label: '管理层' },
  { value: 'general', label: '大众' },
]

const LANGUAGES = [
  { value: 'auto', label: '自动' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'ja', label: '日文' },
]

const EXAMPLE_PROMPTS = [
  {
    label: '产品演示',
    content: `内容创作工具产品介绍\n\n核心价值：让内容创作者10倍提升图文生产效率\n\n问题：传统内容创作需要设计师、写手多人协作，周期长、成本高\n\n解决方案：\n- 输入文字，秒出封面图\n- 一键生成系列配图\n- 支持小红书/公众号/幻灯片多种格式\n\n数据：内测用户平均节省70%制图时间\n\n目标用户：自媒体创作者、内容运营、企业市场团队\n\n商业模式：积分制，按需付费`,
  },
  {
    label: '季度业务复盘',
    content: `2025年Q1业务复盘\n\n业绩总结：\n- 营收 $120万，同比增长35%\n- 新增用户 8500人，MAU达到2.3万\n- NPS评分 72，行业平均45\n\n做得好的：\n- 企业客户续约率92%\n- 内容营销带来40%新增流量\n\n需要改进的：\n- 用户激活率仅38%，行业均值55%\n- 客服响应时间平均4小时，目标是1小时\n\nQ2重点：优化onboarding流程，提升激活率到55%`,
  },
  {
    label: '技术方案分享',
    content: `从单体到微服务：我们的迁移之路\n\n背景：系统日活100万，单体架构已成瓶颈\n\n阶段1：识别热点（第1-2个月）\n- 分析慢查询，找到3个性能瓶颈模块\n- 用户系统、订单系统、推荐系统\n\n阶段2：渐进式拆分（第3-6个月）\n- 先拆读多写少的推荐服务\n- 引入消息队列解耦依赖\n\n阶段3：全面迁移（第7-12个月）\n- 所有核心服务独立部署\n- 建立完整的可观测性体系\n\n结果：系统响应时间从800ms降至120ms`,
  },
  {
    label: '读书分享会',
    content: `《穷查理宝典》核心思想\n\n查理·芒格是谁？\n巴菲特的黄金搭档，伯克希尔哈撒韦副主席，98岁去世时身家达到26亿美元\n\n核心思想1：多元思维模型\n掌握100种来自不同学科的基本思维模型，用来解决问题\n\n核心思想2：逆向思维\n"如果我知道自己会在哪里死去，我就永远不去那个地方"\n先想清楚什么会导致失败，再反向规划\n\n核心思想3：能力圈\n只在自己真正懂的领域做决策，不懂的坚决不碰\n\n核心思想4：耐心等待\n真正的好机会一年可能只有3-4次，等待是一种竞争优势`,
  },
]

export default function SlideDeckPage() {
  const [content, setContent] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [style, setStyle] = useState('blueprint')
  const [audience, setAudience] = useState('general')
  const [slides, setSlides] = useState(1)
  const [lang, setLang] = useState('auto')

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
      const result = await generateApi.slideDeck({ content, style, audience, slides, lang })
      setPortfolioId(result.portfolio_id)
      startPolling(
        result.portfolio_id,
        ({ images }) => {
          setImages(images)
          setLoading(false)
          const currentCredits = useAuthStore.getState().user?.credits ?? 0
          updateCredits(currentCredits - slides)
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
      <FormPanel title="幻灯片" description="从你的内容生成完整幻灯片。" footer={<GenerateBar credits={user?.credits ?? 0} isLoading={loading} onGenerate={handleGenerate} creditCost={slides} />}>
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
        <FormField label="风格">
          <ChipGroup options={STYLES} value={style} onChange={setStyle} />
        </FormField>
        <FormField label="受众">
          <ChipGroup options={AUDIENCES} value={audience} onChange={setAudience} />
        </FormField>
        <FormField label="幻灯片张数">
          <input
            type="number"
            min={1}
            max={8}
            value={slides}
            onChange={e => setSlides(Math.min(8, Math.max(1, parseInt(e.target.value, 10) || 1)))}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
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
        <ResultsPanel images={images} isLoading={loading} columns={3} />
      </div>
    </div>
  )
}
