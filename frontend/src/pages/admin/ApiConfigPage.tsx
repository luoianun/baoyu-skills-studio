import { useState, useEffect } from 'react'
import { adminApi } from '../../api/admin'
import { Spinner } from '../../components/studio/Spinner'

interface ApiConfig {
  image_api_mode: string
  image_model_base_url: string
  image_model_api_key: string
  image_model_name: string
}

const PRESETS = [
  {
    id: 'gpt-image-2',
    label: 'GPT Image 2',
    description: 'OpenAI gpt-image-2，支持 responses API',
    mode: 'openai',
    base_url: 'https://api.openai.com',
    model_name: 'gpt-image-2',
    icon: '✦',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    activeColor: 'bg-emerald-500 border-emerald-500 text-white',
  },
  {
    id: 'banana2',
    label: 'Banana2',
    description: '兼容 OpenAI 格式的图像生成服务',
    mode: 'openai',
    base_url: '',
    model_name: 'banana2',
    icon: '🍌',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    activeColor: 'bg-amber-500 border-amber-500 text-white',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    description: 'Google Gemini 原生图像生成',
    mode: 'gemini',
    base_url: '',
    model_name: 'gemini-2.0-flash-preview-image-generation',
    icon: '◆',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    activeColor: 'bg-blue-500 border-blue-500 text-white',
  },
  {
    id: 'custom',
    label: '自定义',
    description: '手动填写任意 OpenAI 兼容接口',
    mode: 'openai',
    base_url: '',
    model_name: '',
    icon: '⚙',
    color: 'bg-gray-50 border-gray-200 text-gray-600',
    activeColor: 'bg-gray-600 border-gray-600 text-white',
  },
]

function detectPreset(cfg: ApiConfig): string {
  if (cfg.image_model_name === 'gpt-image-2') return 'gpt-image-2'
  if (cfg.image_model_name === 'banana2') return 'banana2'
  if (cfg.image_api_mode === 'gemini') return 'gemini'
  if (cfg.image_model_name || cfg.image_model_base_url) return 'custom'
  return ''
}

export default function ApiConfigPage() {
  const [cfg, setCfg] = useState<ApiConfig>({
    image_api_mode: 'openai',
    image_model_base_url: '',
    image_model_api_key: '',
    image_model_name: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    adminApi.getApiConfig()
      .then((data: ApiConfig) => {
        setCfg(data)
        setSelectedPreset(detectPreset(data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId)
    if (!preset) return
    setSelectedPreset(presetId)
    if (presetId !== 'custom') {
      setCfg(prev => ({
        ...prev,
        image_api_mode: preset.mode,
        image_model_base_url: preset.base_url,
        image_model_name: preset.model_name,
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await adminApi.putApiConfig(cfg)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const activePreset = PRESETS.find(p => p.id === selectedPreset)

  return (
    <div className="w-full p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-on-surface mb-1">图像生成 API</h2>
          <p className="text-sm text-on-surface-variant">配置后立即生效，优先级高于环境变量</p>
        </div>
        {activePreset && (
          <div className="rounded-xl border border-surface-variant bg-white px-4 py-3 text-xs text-on-surface-variant shadow-sm lg:min-w-80">
            <span className="font-semibold text-on-surface">当前：{activePreset.label}</span>
            <span className="mx-2 text-outline-variant">/</span>
            <span>{cfg.image_api_mode === 'gemini' ? 'Gemini 原生' : 'OpenAI 兼容'}</span>
            {cfg.image_model_name && (
              <>
                <span className="mx-2 text-outline-variant">/</span>
                <span className="font-mono text-on-surface">{cfg.image_model_name}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mb-7">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">选择预设</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PRESETS.map(p => {
            const active = selectedPreset === p.id
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`text-left min-h-28 px-5 py-4 rounded-2xl border-2 transition-all ${active ? p.activeColor + ' shadow-lg shadow-black/5' : p.color + ' hover:opacity-90 hover:shadow-sm'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none w-7 text-center flex-shrink-0">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{p.label}</span>
                      {active && <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full bg-white/20">已选</span>}
                    </div>
                    <p className={`text-xs mt-2 leading-relaxed ${active ? 'opacity-85' : 'opacity-65'}`}>{p.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-3">接口配置</p>
        <div className="bg-white rounded-2xl border border-surface-variant shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 border-b border-surface-variant">
            <div className="p-5 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-surface-variant">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-3">调用模式</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: 'openai', label: 'OpenAI 兼容' }, { value: 'gemini', label: 'Gemini 原生' }].map(m => (
                  <button key={m.value} type="button"
                    onClick={() => { setCfg(prev => ({ ...prev, image_api_mode: m.value })); setSelectedPreset('custom') }}
                    className={`py-3 rounded-xl text-sm font-medium border transition-colors ${cfg.image_api_mode === m.value ? 'bg-primary text-white border-primary' : 'border-outline-variant text-on-surface hover:bg-surface'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 lg:col-span-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-3">Base URL</label>
              <input
                type="text"
                value={cfg.image_model_base_url}
                onChange={e => { setCfg(prev => ({ ...prev, image_model_base_url: e.target.value })); setSelectedPreset('custom') }}
                placeholder={cfg.image_api_mode === 'gemini' ? 'https://generativelanguage.googleapis.com（可留空）' : 'https://api.openai.com'}
                className="w-full border border-outline-variant rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
              <p className="text-[11px] text-on-surface-variant/60 mt-2">
                {cfg.image_api_mode === 'gemini' ? 'Gemini 模式留空时使用默认 Google 端点' : 'OpenAI 兼容模式下填写接口根地址，不需要包含 /v1/chat/completions'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-surface-variant">
            <div className="p-5 border-b lg:border-b-0 lg:border-r border-surface-variant">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-3">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={cfg.image_model_api_key}
                  onChange={e => setCfg(prev => ({ ...prev, image_model_api_key: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full border border-outline-variant rounded-xl px-3.5 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">{showKey ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant/60 mt-2">Key 仅存储于服务器数据库，不会在页面中明文展示</p>
            </div>

            <div className="p-5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide block mb-3">
                模型名称
                <span className="normal-case font-normal ml-1 text-on-surface-variant/50">可自定义</span>
              </label>
              <input
                type="text"
                value={cfg.image_model_name}
                onChange={e => setCfg(prev => ({ ...prev, image_model_name: e.target.value }))}
                placeholder="gpt-image-2 / banana2 / gemini-2.0-flash-preview-image-generation"
                className="w-full border border-outline-variant rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
              <p className="text-[11px] text-on-surface-variant/60 mt-2">选择预设后仍可按服务商实际模型名手动修改</p>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface/40">
            <div className="text-xs text-on-surface-variant">
              保存后新生成任务立即使用该配置，已在队列中的任务不受影响。
            </div>
            <div className="flex items-center gap-3">
              {error && <span className="text-error text-sm">{error}</span>}
              {saved && (
                <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  已保存
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 transition-colors">
                {saving ? '保存中...' : '保存配置'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
