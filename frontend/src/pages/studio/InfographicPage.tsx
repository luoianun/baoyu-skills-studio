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

const LAYOUTS = [
  { value: 'linear-progression', label: '线性时间轴' },
  { value: 'bento-grid', label: '便当格布局' },
  { value: 'timeline', label: '流程时间轴' },
  { value: 'comparison', label: '二元对比' },
  { value: 'hub-spoke', label: '中心辐射' },
  { value: 'process-flow', label: '循环流程' },
  { value: 'pyramid', label: '层级金字塔' },
  { value: 'grid-matrix', label: '对比矩阵' },
]

const STYLES = [
  { value: 'craft-handmade', label: '手工纸艺' },
  { value: 'technical-schematic', label: '技术蓝图' },
  { value: 'editorial-magazine', label: '编辑杂志' },
  { value: 'infographic-classic', label: '孟菲斯商务' },
  { value: 'data-viz', label: '赛博朋克' },
  { value: 'minimal-clean', label: '极简留白' },
  { value: 'vibrant-pop', label: '波普漫画' },
  { value: 'notebook-sketch', label: '黑板报' },
]

const ASPECTS = [
  { value: 'landscape', label: '16:9横图' },
  { value: 'portrait', label: '9:16竖图' },
  { value: 'square', label: '1:1方图' },
]

const LANGUAGES = [
  { value: 'auto', label: '自动' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'ja', label: '日文' },
]

const EXAMPLE_PROMPTS = [
  {
    label: '互联网发展时间轴',
    content: `互联网技术发展历程\n\n1991年 — 万维网（WWW）正式向公众开放\n1998年 — Google搜索引擎上线，改变信息获取方式\n2004年 — Facebook创立，社交网络时代开启\n2007年 — iPhone发布，移动互联网时代到来\n2010年 — 微信推出，即时通讯与生活服务深度融合\n2015年 — 直播经济兴起，内容创作者生态形成\n2020年 — 短视频成为主流内容形态\n2023年 — 生成式内容工具普及，创作门槛大幅降低`,
  },
  {
    label: '技术选型对比',
    content: `前端框架选型对比：React vs Vue vs Svelte\n\nReact\n- 生态最大，npm周下载量5000万+\n- 学习曲线较陡，需要理解hooks\n- 适合大型应用和复杂交互\n\nVue\n- 中文文档完善，国内最流行\n- 渐进式框架，上手快\n- 适合中小型项目和快速开发\n\nSvelte\n- 编译时框架，无虚拟DOM\n- 代码量最少，性能最好\n- 生态较小，适合追求极致性能的项目`,
  },
  {
    label: '用户增长漏斗',
    content: `SaaS产品用户增长漏斗分析\n\n曝光层：每月UV 10万\n注册层：注册率 8% = 8000人\n激活层：完成首次核心操作 40% = 3200人\n留存层：7日留存 60% = 1920人\n付费层：付费转化率 5% = 96人\n扩展层：NPS推荐带来 20% 新增\n\n关键卡点：注册→激活环节流失最多\n优化方向：简化onboarding流程，缩短用户到达"aha moment"的路径`,
  },
  {
    label: '学习方法论',
    content: `费曼学习法：最有效的学习方式\n\n第1步：选择一个概念\n选一个你想真正理解的知识点\n\n第2步：用简单语言解释\n假设你要向一个12岁的孩子解释，用最简单的话说清楚\n\n第3步：找到卡住的地方\n遇到解释不清楚的地方，就是你真正不懂的地方\n\n第4步：回到源头学习\n针对不懂的地方，回去重新学习\n\n第5步：简化和类比\n用类比和故事来代替术语，直到真正内化`,
  },
]

export default function InfographicPage() {
  const [content, setContent] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [layout, setLayout] = useState('bento-grid')
  const [style, setStyle] = useState('craft-handmade')
  const [aspect, setAspect] = useState('landscape')
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
      const result = await generateApi.infographic({ content, layout, style, aspect, lang })
      setPortfolioId(result.portfolio_id)
      startPolling(
        result.portfolio_id,
        ({ images }) => {
          setImages(images)
          setLoading(false)
          const currentCredits = useAuthStore.getState().user?.credits ?? 0
          updateCredits(currentCredits - 1)
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
      <FormPanel title="信息图" description="将你的内容转化为视觉丰富的信息图。" footer={<GenerateBar credits={user?.credits ?? 0} isLoading={loading} onGenerate={handleGenerate} />}>
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
        <FormField label="布局">
          <ChipGroup options={LAYOUTS} value={layout} onChange={setLayout} />
        </FormField>
        <FormField label="风格">
          <ChipGroup options={STYLES} value={style} onChange={setStyle} />
        </FormField>
        <FormField label="输出比例">
          <ChipGroup options={ASPECTS} value={aspect} onChange={setAspect} />
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
        <ResultsPanel images={images} isLoading={loading} columns={1} />
      </div>
    </div>
  )
}
