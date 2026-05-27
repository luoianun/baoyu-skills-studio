interface ChipGroupProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}
export function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={`min-h-10 px-3 py-2 rounded-full text-xs font-medium transition-colors border
            ${value === opt.value
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary/50'}`}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}
