'use client'

type Props = {
  value: number | null
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: Props) {
  const textSize = size === 'sm' ? 'text-base' : 'text-xl'

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${textSize} leading-none transition-colors ${
            star <= (value ?? 0) ? 'text-yellow-400' : 'text-gray-300'
          } ${!readonly ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function StarDisplay({ value }: { value: number | null }) {
  return <StarRating value={value} readonly size="sm" />
}
