import { useState } from "react"
import { PlainTextEditor } from "./PlainTextEditor"
import { RichTextEditor } from "./RichTextEditor"

type MultiLangRichTextValue = {
  [language: string]: string
}

type MultiLangRichTextProps = {
  field: string
  format?: string
  value?: MultiLangRichTextValue
  onChange: (value: MultiLangRichTextValue) => void
  languages: string[]
}

let cnt = 0
const genId = (type: string, key: string, lang: string): string => {
  cnt = (cnt + 1) % 100
  return `${type}_${key}_${lang}_${cnt}`
}

export const MultiLangRichTextEditor = ({
  field,
  format,
  value = {},
  onChange,
  languages,
}: MultiLangRichTextProps) => {
  const [activeLang, setActiveLang] = useState<string>(languages[0])

  return (
    <div className="ml-field">
      {/* Tabs per field */}
      <div className="ml-tabs">
        {languages.map((lang) => (
          <button
            key={genId('tabs', field, lang)}
            className={lang === activeLang ? 'active' : ''}
            onClick={() => setActiveLang(lang)}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {format === 'html' ? (
        <RichTextEditor
          key={genId('editor', field, activeLang)}
          value={value[activeLang] || ''}
          className="ml-editor"
          onChange={(content) =>
            onChange({
              ...value,
              [activeLang]: content,
            })
          }
        />
      ) : format === 'text' ? (
        <PlainTextEditor
          key={genId('textarea', field, activeLang)}
          value={value[activeLang] || ''}
          className="ml-textarea"
          onChange={(content) =>
            onChange({
              ...value,
              [activeLang]: content,
            })
          }
        />
      ) : (
        <input
          key={genId('input', field, activeLang)}
          value={value[activeLang] || ''}
          className="ml-input"
          onChange={(e) =>
            onChange({
              ...value,
              [activeLang]: e.target.value,
            })
          }
        />
      )}


    </div>
  )
}
