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

const COVER_TYPES = [
  { value: 'hero', label: '英雄图' },
  { value: 'conceptual', label: '概念型' },
  { value: 'typography', label: '字体型' },
  { value: 'metaphor', label: '隐喻' },
  { value: 'scene', label: '场景' },
  { value: 'minimal', label: '极简' },
]

const COLOR_PALETTES = [
  { value: 'warm', label: '暖色调' },
  { value: 'elegant', label: '优雅金' },
  { value: 'cool', label: '冷色调' },
  { value: 'dark', label: '暗黑深邃' },
  { value: 'earth', label: '大地色系' },
  { value: 'vivid', label: '鲜艳饱和' },
  { value: 'pastel', label: '柔和粉彩' },
  { value: 'mono', label: '单色灰阶' },
  { value: 'retro', label: '复古70年代' },
  { value: 'duotone', label: '双色调' },
]

const RENDERING_STYLES = [
  { value: 'flat-vector', label: '扁平矢量' },
  { value: 'hand-drawn', label: '手绘素描' },
  { value: 'painterly', label: '油画质感' },
  { value: 'digital', label: '数字插画' },
  { value: 'pixel', label: '像素风' },
  { value: 'chalk', label: '粉笔黑板' },
  { value: 'screen-print', label: '丝网印刷' },
]

const TEXT_LEVELS = [
  { value: 'none', label: '无文字' },
  { value: 'title-only', label: '仅标题' },
  { value: 'title-subtitle', label: '标题+副标题' },
  { value: 'text-rich', label: '图文丰富' },
]

const MOODS = [
  { value: 'subtle', label: '克制内敛' },
  { value: 'balanced', label: '均衡适中' },
  { value: 'bold', label: '大胆张扬' },
]

const FONTS = [
  { label: '无衬线', value: 'clean' },
  { label: '手写', value: 'handwritten' },
  { label: '衬线', value: 'serif' },
  { label: '展示', value: 'display' },
]

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '2.35:1', label: '2.35:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '1:1', label: '1:1' },
  { value: '3:4', label: '3:4' },
]

const LANGUAGES = [
  { value: 'auto', label: '自动' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'ja', label: '日文' },
]

const EXAMPLE_PROMPTS = [
  {
    label: '副业变现',
    content: '普通人每月多赚5000元：3条切实可行的副业路线',
  },
  {
    label: '深度工作法',
    content: '为什么你努力了还是没结果？深度工作vs浅度工作的本质区别',
  },
  {
    label: '极简主义生活',
    content: '断舍离一年后，我的生活发生了什么变化',
  },
  {
    label: '创业复盘',
    content: '从0到百万用户：我们走过的弯路与关键决策',
  },
]

export default function CoverImagePage() {
  const [content, setContent] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [type, setType] = useState('conceptual')
  const [palette, setPalette] = useState('warm')
  const [rendering, setRendering] = useState('flat-vector')
  const [textLevel, setTextLevel] = useState('title-only')
  const [mood, setMood] = useState('balanced')
  const [font, setFont] = useState('clean')
  const [aspect, setAspect] = useState('16:9')
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
      const result = await generateApi.coverImage({ content, type, palette, rendering, text_level: textLevel, mood, font, aspect, lang })
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
      <FormPanel title="封面图" description="为你的文章或内容生成精美封面图。" footer={<GenerateBar credits={user?.credits ?? 0} isLoading={loading} onGenerate={handleGenerate} />}>
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
                  <span className="text-on-surface-variant ml-1 line-clamp-1">{ex.content}</span>
                </button>
              ))}
            </div>
          )}
        </FormField>
        <FormField label="封面类型">
          <ChipGroup options={COVER_TYPES} value={type} onChange={setType} />
        </FormField>
        <FormField label="配色方案">
          <ChipGroup options={COLOR_PALETTES} value={palette} onChange={setPalette} />
        </FormField>
        <FormField label="渲染风格">
          <ChipGroup options={RENDERING_STYLES} value={rendering} onChange={setRendering} />
        </FormField>
        <FormField label="文字层级">
          <ChipGroup options={TEXT_LEVELS} value={textLevel} onChange={setTextLevel} />
        </FormField>
        <FormField label="氛围基调">
          <ChipGroup options={MOODS} value={mood} onChange={setMood} />
        </FormField>
        <FormField label="字体风格">
          <ChipGroup options={FONTS} value={font} onChange={setFont} />
        </FormField>
        <FormField label="输出比例">
          <ChipGroup options={ASPECT_RATIOS} value={aspect} onChange={setAspect} />
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
