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

const ART_STYLES = [
  { value: 'ligne-claire', label: '欧式线描' },
  { value: 'manga', label: '日本漫画' },
  { value: 'realistic', label: '写实数字' },
  { value: 'ink-brush', label: '中国水墨' },
  { value: 'chalk', label: '粉笔黑板' },
]

const TONES = [
  { value: 'neutral', label: '中立教育' },
  { value: 'warm', label: '温暖怀旧' },
  { value: 'dramatic', label: '戏剧张力' },
  { value: 'romantic', label: '浪漫唯美' },
  { value: 'energetic', label: '活力动感' },
  { value: 'vintage', label: '历史复古' },
]

const LAYOUTS = [
  { value: 'standard', label: '标准' },
  { value: 'cinematic', label: '宽幅电影' },
  { value: 'dense', label: '高密' },
  { value: 'splash', label: '大开本' },
  { value: 'mixed', label: '混合' },
  { value: 'webtoon', label: '条漫' },
]

const ASPECTS = [
  { value: '3:4', label: '3:4竖版' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
]

const LANGUAGES = [
  { value: 'auto', label: '自动' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'ja', label: '日文' },
]

const EXAMPLE_PROMPTS = [
  {
    label: '打工人的一天',
    content: `打工人的一天\n\n早上9点：挤地铁上班，扶手上挂满了人，主角紧紧抱着奶茶\n上午10点：开晨会，PPT还没做，假装认真记笔记\n中午12点：和同事抢食堂，最后一份红烧肉被抢走，只剩青菜\n下午3点：困意袭来，偷偷在工位打盹被老板发现\n晚上9点：终于下班，地铁里一秒睡着\n凌晨12点：回到家，躺在床上，明天又是新的一天`,
  },
  {
    label: '程序员改Bug',
    content: `程序员改Bug的心路历程\n\n第1格：收到Bug报告，"这肯定不是我的问题"\n第2格：查了半小时，"好吧可能是我的问题"\n第3格：改了一行代码，"完美，解决了！"\n第4格：提交代码，新出了5个Bug\n第5格：对着屏幕沉默\n第6格：加班到凌晨，终于修好，对着空荡荡的办公室笑了`,
  },
  {
    label: '量子力学入门',
    content: `量子世界的奇妙规则\n\n第1格：薛定谔的猫——箱子没打开之前，猫既是活的又是死的\n第2格：观测影响结果——当你观测电子，它就从"可能在任何地方"坍缩到一个位置\n第3格：量子纠缠——两个粒子像心灵感应，一个改变，另一个瞬间响应，不管相距多远\n第4格：不确定性原理——你越精确地知道粒子的位置，你就越不知道它的速度`,
  },
  {
    label: '复利的力量',
    content: `复利的力量\n\n第1格：小明每天只比昨天进步1%\n第2格：一年后，他进步了多少？\n第3格：数学计算：1.01的365次方 = 37.78\n第4格：他变成了37倍的自己！\n第5格：反过来，每天退步1%：0.99的365次方 = 0.026\n第6格：一年后只剩下2.6%的自己\n第7格：结论：坚持微小的进步，时间会给你惊喜`,
  },
]

export default function ComicPage() {
  const [content, setContent] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [art, setArt] = useState('ligne-claire')
  const [tone, setTone] = useState('neutral')
  const [layout, setLayout] = useState('standard')
  const [aspect, setAspect] = useState('3:4')
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
      const result = await generateApi.comic({ content, art, tone, layout, aspect, lang })
      setPortfolioId(result.portfolio_id)
      const deduct = result.image_count ?? 4
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
      <FormPanel title="知识漫画" description="将你的故事转化为漫画。" footer={<GenerateBar credits={user?.credits ?? 0} isLoading={loading} onGenerate={handleGenerate} creditCost={4} />}>
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
        <FormField label="画风">
          <ChipGroup options={ART_STYLES} value={art} onChange={setArt} />
        </FormField>
        <FormField label="基调">
          <ChipGroup options={TONES} value={tone} onChange={setTone} />
        </FormField>
        <FormField label="版式">
          <ChipGroup options={LAYOUTS} value={layout} onChange={setLayout} />
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
        <ResultsPanel images={images} isLoading={loading} columns={2} />
      </div>
    </div>
  )
}
