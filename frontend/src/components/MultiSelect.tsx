import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'

export interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  label?: string
  placeholder?: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  className?: string
}

const MultiSelect = ({ label, placeholder = 'Select...', options, value, onChange, className }: MultiSelectProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  const clearAll = () => onChange([])

  const selectedOptions = options.filter((o) => value.includes(o.value))
  const displayText = selectedOptions.length
    ? selectedOptions.slice(0, 2).map((o) => o.label).join(', ') + (selectedOptions.length > 2 ? ` +${selectedOptions.length - 2}` : '')
    : placeholder

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className || ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <button
        type="button"
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${open ? 'border-primary-300 ring-2 ring-primary-200' : 'border-gray-300'} bg-white text-left`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`truncate ${selectedOptions.length ? 'text-gray-900' : 'text-gray-400'}`}>{displayText}</span>
        <div className="flex items-center space-x-2">
          {selectedOptions.length > 0 && (
            <X
              className="h-4 w-4 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation()
                clearAll()
              }}
            />
          )}
          <ChevronDown className={`h-4 w-4 ${open ? 'text-primary-600' : 'text-gray-500'}`} />
        </div>
      </button>

      {open && (
        <div className="mt-2 absolute z-50 left-0 right-0 max-h-64 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          {options.map((opt) => {
            const checked = value.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 ${checked ? 'bg-primary-50' : ''}`}
                onClick={() => toggleValue(opt.value)}
              >
                <span className="text-sm text-gray-700">{opt.label}</span>
                {checked && <Check className="h-4 w-4 text-primary-600" />}
              </button>
            )
          })}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No options</div>
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelect


