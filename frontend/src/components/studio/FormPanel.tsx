export function FormPanel({ title, description, children, footer }: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="w-full bg-white border-b border-surface-variant md:w-1/3 md:flex-shrink-0 md:border-b-0 md:border-r md:flex md:flex-col md:h-full">
      <div className="px-4 py-4 sm:px-5 sm:py-5 border-b border-surface-variant md:flex-shrink-0">
        <h2 className="font-bold text-on-surface">{title}</h2>
        {description && <p className="text-on-surface-variant text-xs mt-1">{description}</p>}
      </div>
      <div className="px-4 py-4 sm:px-5 sm:py-5 space-y-5 md:flex-1 md:overflow-y-auto">
        {children}
      </div>
      {footer && <div className="md:flex-shrink-0">{footer}</div>}
    </div>
  )
}
