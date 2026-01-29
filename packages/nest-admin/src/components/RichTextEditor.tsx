import { Editor } from '@tinymce/tinymce-react'
import { ENV } from '../config/env'

type Props = {
  value: string
  className?: string
  onChange: (content: string) => void
}

export const RichTextEditor = ({ value, className, onChange }: Props) => {
  return (
    <Editor
      apiKey={ENV.tinyMCE}
      value={value}
      className={className}
      onEditorChange={(content: string) => onChange(content)}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'help',
          'wordcount',
        ],
        toolbar:
          'undo redo | blocks | ' +
          'bold italic underline | alignleft aligncenter alignright | ' +
          'bullist numlist outdent indent | image link | code',
        block_formats:
          'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4',
        content_style:
          'body { font-family: Inter, system-ui; font-size: 14px }',
      }}
    />
  )
}
