import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { portfolioApi } from '../../api/portfolios'
import { Lightbox } from '../../components/portfolio/Lightbox'
import { Spinner } from '../../components/studio/Spinner'
import { useUIStore } from '../../store/ui'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const MODULE_LABELS: Record<string, string> = {
  cover_image: '封面图',
  infographic: '信息图',
  article_illustrator: '文章配图',
  comic: '知识漫画',
  slide_deck: '幻灯片',
  xhs_images: '小红书配图',
}

const MODULE_DISPLAY: Record<string, { aspect: string; cols: string }> = {
  slide_deck:           { aspect: 'aspect-video',  cols: 'grid-cols-2' },
  article_illustrator:  { aspect: 'aspect-video',  cols: 'grid-cols-2' },
  xhs_images:           { aspect: 'aspect-[3/4]',  cols: 'grid-cols-4' },
}

const VALUE_LABELS: Record<string, string> = {
  auto: '自动', zh: '中文', en: '英文', ja: '日文',
  hero: '英雄图', conceptual: '概念型', typography: '字体型', metaphor: '隐喻', scene: '场景', minimal: '极简',
  warm: '暖色调', elegant: '优雅金', cool: '冷色调', dark: '暗黑深邃', earth: '大地色系',
  vivid: '鲜艳饱和', pastel: '柔和粉彩', mono: '单色灰阶', retro: '复古70年代', duotone: '双色调',
  'flat-vector': '扁平矢量', 'hand-drawn': '手绘素描', painterly: '油画质感', digital: '数字插画',
  pixel: '像素风', chalk: '粉笔黑板', 'screen-print': '丝网印刷',
  none: '无文字', 'title-only': '仅标题', 'title-subtitle': '标题+副标题', 'text-rich': '图文丰富',
  subtle: '克制内敛', balanced: '均衡适中', bold: '大胆张扬',
  clean: '无衬线', handwritten: '手写', serif: '衬线', display: '展示',
  'linear-progression': '线性时间轴', 'bento-grid': '便当格布局', timeline: '流程时间轴',
  comparison: '二元对比', 'hub-spoke': '中心辐射', 'process-flow': '循环流程',
  pyramid: '层级金字塔', 'grid-matrix': '对比矩阵',
  'craft-handmade': '手工纸艺', 'technical-schematic': '技术蓝图', 'editorial-magazine': '编辑杂志',
  'infographic-classic': '孟菲斯商务', 'data-viz': '赛博朋克', 'minimal-clean': '极简留白',
  'vibrant-pop': '波普漫画', 'notebook-sketch': '黑板报',
  landscape: '16:9横图', portrait: '9:16竖图',
  infographic: '信息图', illustration: '插画', diagram: '流程图',
  notion: 'Notion风格', editorial: '编辑杂志', sketch: '铅笔素描', blueprint: '技术蓝图',
  'per-section': '按段落', rich: '丰富',
  'ligne-claire': '欧式线描', manga: '日本漫画', realistic: '写实数字', 'ink-brush': '中国水墨',
  neutral: '中立教育', dramatic: '戏剧张力', romantic: '浪漫唯美', energetic: '活力动感', vintage: '历史复古',
  standard: '标准', cinematic: '宽幅电影', dense: '高密', splash: '大开本', mixed: '混合', webtoon: '条漫',
  chalkboard: '黑板课堂', corporate: '商务正式', gradient: '水彩温柔', colorful: '大胆编辑',
  beginners: '初学者', intermediate: '进阶', experts: '专家', executives: '管理层', general: '大众',
  fresh: '清新自然', pop: '波普活力', cute: '可爱萌系', 'study-notes': '手写笔记',
  sparse: '稀疏留白', list: '列表排行', flow: '流程时间轴', mindmap: '思维导图', quadrant: '四象限',
  'A-story': '故事驱动型', 'B-info': '信息密集型', 'C-visual': '视觉优先型',
}

const PARAM_LABELS: Record<string, Record<string, string>> = {
  cover_image: {
    content: '内容', type: '封面类型', palette: '配色方案', rendering: '渲染风格',
    text_level: '文字层级', mood: '情绪', font: '字体', aspect: '比例', lang: '语言',
  },
  infographic: { content: '内容', layout: '布局', style: '风格', aspect: '比例', lang: '语言' },
  article_illustrator: { content: '内容', type: '类型', style: '风格', density: '密度', lang: '语言' },
  comic: { content: '内容', art: '画风', tone: '基调', layout: '版式', aspect: '比例', lang: '语言' },
  slide_deck: { content: '内容', style: '风格', audience: '受众', slides: '页数', lang: '语言' },
  xhs_images: { content: '内容', style: '风格', layout: '布局', image_count: '图片数', strategy: '策略', lang: '语言' },
}

interface PortfolioDetail {
  id: string
  module: string
  title: string
  image_count: number
  created_at: string
  completed_at: string | null
  params: Record<string, any>
  images: { url: string; filename: string }[]
}

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const { setPortfolioModule, clearPortfolioModule } = useUIStore()

  useEffect(() => {
    if (!id) return
    portfolioApi.get(id).then(data => {
      setPortfolio(data)
      setTitle(data.title)
      setPortfolioModule(MODULE_LABELS[data.module] ?? data.module)
      setLoading(false)
    }).catch(() => {
      navigate('/portfolios')
    })
    return () => clearPortfolioModule()
  }, [id])

  const saveTitle = async () => {
    if (!portfolio || !title.trim() || title === portfolio.title) { setEditing(false); return }
    await portfolioApi.rename(portfolio.id, title.trim())
    setPortfolio({ ...portfolio, title: title.trim() })
    setEditing(false)
  }

  const downloadAll = async () => {
    if (!portfolio) return
    const zip = new JSZip()
    await Promise.all(portfolio.images.map(async img => {
      const res = await fetch(img.url)
      const blob = await res.blob()
      zip.file(img.filename, blob)
    }))
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${portfolio.title}.zip`)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!portfolio) return null

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          {editing ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitle(portfolio.title); setEditing(false) } }}
              className="text-2xl font-bold border-b border-primary outline-none w-full"
            />
          ) : (
            <h1
              className="text-2xl font-bold text-on-surface cursor-pointer hover:text-primary"
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {portfolio.title}
            </h1>
          )}
          <p className="text-on-surface-variant text-sm mt-1">
            {portfolio.image_count} 张图片 · {new Date(portfolio.created_at).toLocaleDateString()}
          </p>
        </div>
        <button onClick={downloadAll}
          className="flex items-center gap-2 border border-outline-variant rounded-lg px-4 py-2 text-sm font-medium hover:bg-surface transition-colors">
          <span className="material-symbols-outlined text-[18px]">download</span>
          下载全部
        </button>
      </div>

      {portfolio.params && Object.keys(portfolio.params).length > 0 && (
        <div className="mb-6 bg-white rounded-xl border border-surface-variant p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">tune</span>
            <p className="text-sm font-semibold text-on-surface">创作参数</p>
            <span className="ml-auto text-xs text-on-surface-variant">
              生成时间：{portfolio.completed_at
                ? new Date(portfolio.completed_at).toLocaleString()
                : new Date(portfolio.created_at).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(portfolio.params).map(([key, val]) => {
              if (key === 'content') return null
              const label = PARAM_LABELS[portfolio.module]?.[key] ?? key
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant w-20 flex-shrink-0">{label}</span>
                  <span className="text-xs font-medium text-on-surface bg-surface-container px-2 py-0.5 rounded">{VALUE_LABELS[String(val)] ?? String(val)}</span>
                </div>
              )
            })}
          </div>
          {portfolio.params.content && (
            <div className="mt-4 pt-4 border-t border-surface-variant">
              <p className="text-xs text-on-surface-variant mb-1.5">{PARAM_LABELS[portfolio.module]?.content ?? '内容'}</p>
              <p className="text-sm text-on-surface bg-surface-container rounded-lg p-3 whitespace-pre-wrap leading-relaxed">{portfolio.params.content}</p>
            </div>
          )}
        </div>
      )}

      <div className={`grid gap-4 ${MODULE_DISPLAY[portfolio.module]?.cols ?? 'grid-cols-3'}`}>
        {portfolio.images.map((img, i) => (
          <div key={i} className={`group relative rounded-xl overflow-hidden bg-surface-variant cursor-pointer ${MODULE_DISPLAY[portfolio.module]?.aspect ?? 'aspect-video'}`}
               onClick={() => setLightboxIndex(i)}>
            <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={portfolio.images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(prev => Math.max(0, (prev ?? 0) - 1))}
          onNext={() => setLightboxIndex(prev => Math.min(portfolio.images.length - 1, (prev ?? 0) + 1))}
        />
      )}
    </div>
  )
}
