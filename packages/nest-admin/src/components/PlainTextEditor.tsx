type PlainTextEditorProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const PlainTextEditor = ({
  value,
  onChange,
  className,
}: PlainTextEditorProps) => {
  return (
    <textarea
      className={`ml-editor ml-editor--plain ${className ?? ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck
    />
  )
}
