import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { useAuthStore } from '../../store/auth'
import { generateApi } from '../../api/generate'
import { useGenerationPolling } from '../../hooks/useGenerationPolling'
import { FormPanel } from '../../components/studio/FormPanel'
import { FormField } from '../../components/studio/FormField'
import { ChipGroup } from '../../components/studio/ChipGroup'
import { GenerateBar } from '../../components/studio/GenerateBar'
import { ResultsPanel } from '../../components/studio/ResultsPanel'

const STYLES = [
  { value: 'cute', label: '可爱萌系' },
  { value: 'fresh', label: '清新自然' },
  { value: 'warm', label: '温暖治愈' },
  { value: 'bold', label: '大胆冲击' },
  { value: 'minimal', label: '极简高冷' },
  { value: 'retro', label: '复古潮流' },
  { value: 'pop', label: '波普活力' },
  { value: 'notion', label: 'Notion线稿' },
  { value: 'chalkboard', label: '黑板粉笔' },
  { value: 'study-notes', label: '手写笔记' },
  { value: 'screen-print', label: '丝网印刷' },
]

const LAYOUTS = [
  { value: 'sparse', label: '稀疏留白' },
  { value: 'balanced', label: '均衡布局' },
  { value: 'dense', label: '密集知识卡' },
  { value: 'list', label: '列表排行' },
  { value: 'comparison', label: '对比双栏' },
  { value: 'flow', label: '流程时间轴' },
  { value: 'mindmap', label: '思维导图' },
  { value: 'quadrant', label: '四象限' },
]

const STRATEGIES = [
  { value: 'auto', label: '自动' },
  { value: 'A-story', label: 'A. 故事驱动型' },
  { value: 'B-info', label: 'B. 信息密集型' },
  { value: 'C-visual', label: 'C. 视觉优先型' },
]

const LANGUAGES = [
  { value: 'auto', label: '自动' },
  { value: 'zh', label: '中文' },
  { value: 'en', label: '英文' },
  { value: 'ja', label: '日文' },
]

const EXAMPLE_PROMPTS = [
  {
    label: '网络安全常识',
    content: `开源软件供应链安全警告\n\n开源依赖库广泛应用于各类软件项目，一旦被恶意篡改，影响范围极广。\n\n常见风险类型：\n- 恶意代码注入，窃取本地凭证与密钥\n- 伪造版本号，诱导用户升级到含毒版本\n- 依赖混淆攻击，利用同名包实施投毒\n\n受影响场景：开发者本地环境、CI/CD流水线、生产服务器\n\n自查建议：\n1. 定期审查项目依赖版本\n2. 使用私有镜像仓库，避免直接拉取公共源\n3. 配置依赖完整性校验（hash锁定）\n4. 发现可疑版本立即升级并轮换所有相关密钥`,
  },
  {
    label: 'Claude Code技巧',
    content: `Claude Code 5个高效使用技巧\n\n1. 用/clear重置上下文，避免模型被无关信息干扰\n2. CLAUDE.md写项目规范，每次对话自动遵守\n3. 用--dangerously-skip-permissions跳过重复确认（自动化场景）\n4. 多文件修改前先让Claude读懂相关文件\n5. 复杂任务拆分小步骤，每步提交一次git`,
  },
  {
    label: '职场晋升方法',
    content: `普通员工到技术Leader的晋升路径\n\n阶段1：做好执行者（0-2年）\n- 快速交付，少出错，多问多学\n- 建立可信度：说到做到\n\n阶段2：成为专家（2-4年）\n- 在某个方向成为团队里最懂的人\n- 主动承接有挑战的项目\n\n阶段3：影响他人（4年+）\n- 帮助别人成长，不只关注个人产出\n- 推动跨团队协作，解决系统性问题\n\n核心：晋升是结果，不是目标。专注于创造价值，职级会自然跟上。`,
  },
  {
    label: 'Python学习路线',
    content: `Python从零到能干活的学习路线\n\n第1个月：基础语法\n- 变量、循环、函数、文件操作\n- 推荐：Python官方教程 + 每天写30行代码\n\n第2个月：实战项目\n- 爬虫：requests + BeautifulSoup\n- 数据：pandas + matplotlib\n- 自动化：selenium / playwright\n\n第3个月：进阶\n- 面向对象、装饰器、异步编程\n- 学会看报错、会用Stack Overflow\n\n最快学会的方法：带着真实问题去学，不要只看教程。`,
  },
]

export default function XhsImagesPage() {
  const [content, setContent] = useState('')
  const [showExamples, setShowExamples] = useState(false)
  const [style, setStyle] = useState('cute')
  const [layout, setLayout] = useState('balanced')
  const [imageCount, setImageCount] = useState(1)
  const [strategy, setStrategy] = useState('auto')
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
      const result = await generateApi.xhsImages({ content, style, layout, image_count: imageCount, strategy, lang })
      setPortfolioId(result.portfolio_id)
      startPolling(
        result.portfolio_id,
        ({ images }) => {
          setImages(images)
          setLoading(false)
          const currentCredits = useAuthStore.getState().user?.credits ?? 0
          updateCredits(currentCredits - imageCount)
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

  const downloadAll = async () => {
    const zip = new JSZip()
    await Promise.all(images.map(async img => {
      const res = await fetch(img.url)
      const blob = await res.blob()
      zip.file(img.filename, blob)
    }))
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'xhs-series.zip')
  }

  return (
    <div className="flex flex-col md:flex-row md:h-full">
      <FormPanel title="小红书配图" description="为小红书帖子生成系列图片。" footer={<GenerateBar credits={user?.credits ?? 0} isLoading={loading} onGenerate={handleGenerate} creditCost={imageCount} />}>
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
        <FormField label="版式">
          <ChipGroup options={LAYOUTS} value={layout} onChange={setLayout} />
        </FormField>
        <FormField label="张数">
          <input
            type="number"
            min={1}
            max={6}
            value={imageCount}
            onChange={e => setImageCount(Math.min(6, Math.max(1, parseInt(e.target.value, 10) || 1)))}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
        </FormField>
        <FormField label="策略">
          <ChipGroup options={STRATEGIES} value={strategy} onChange={setStrategy} />
        </FormField>
        <FormField label="语言">
          <ChipGroup options={LANGUAGES} value={lang} onChange={setLang} />
        </FormField>
      </FormPanel>

      <div className="flex-1 min-w-0 flex flex-col">
        {portfolioId && !loading && (
          <div className="px-4 py-3 sm:px-6 bg-white border-b border-surface-variant flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-on-surface-variant">生成完成</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={downloadAll}
                className="text-sm font-medium border border-outline-variant rounded-lg px-3 py-1.5 hover:bg-surface transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                下载全部
              </button>
              <button
                onClick={() => navigate(`/portfolios/${portfolioId}`)}
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
              >
                查看作品集 <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
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
