import { useEffect } from "react"

type FilePreviewProps = {
  file: File
}

export const FilePreview = ({ file }: FilePreviewProps) => {
  const url = URL.createObjectURL(file)

  // Cleanup to avoid memory leak
  useEffect(() => {
    return () => URL.revokeObjectURL(url)
  }, [url])

  if (file.type.startsWith('image/')) {
    return (
      <img
        src={url}
        alt={file.name}
        className="file-preview-image"
      />
    )
  }

  if (file.type === 'application/pdf') {
    return (
      <iframe
        src={url}
        className="file-preview-pdf"
        title={file.name}
      />
    )
  }

  return (
    <div className="file-preview-generic">
      <span>📎 {file.name}</span>
      <span>{(file.size / 1024).toFixed(1)} KB</span>
    </div>
  )
}
