
export function BooleanIcon({ value }: { value: boolean }) {
  const color = value ? '#22c55e' : '#ef4444'
  const label = value ? 'Yes' : 'No'
  return (
    <span
      title={label}
      aria-label={label}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
    >
      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
        }}
      />
    </span>
  )
}
