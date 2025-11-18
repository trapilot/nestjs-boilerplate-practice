export enum ENUM_FILE_TYPE {
  AUDIO = 'audio',
  IMAGE = 'image',
  EXCEL = 'excel',
  VIDEO = 'video',
}

export enum ENUM_FILE_MIME_IMAGE {
  JPG = 'image/jpg',
  JPEG = 'image/jpeg',
  PNG = 'image/png',
}

export enum ENUM_FILE_MIME_DOCUMENT {
  PDF = 'application/pdf',
}

export enum ENUM_FILE_MIME_ARCHIE {
  GZIP = 'application/gzip',
}

export enum ENUM_FILE_MIME_EXCEL {
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  CSV = 'text/csv',
}

export enum ENUM_FILE_MIME_AUDIO {
  MPEG = 'audio/mpeg',
  MP3 = 'audio/mp3',
  M4A = 'audio/x-m4a',
}

export enum ENUM_FILE_MIME_VIDEO {
  MP4 = 'application/mp4',
  MPEG = 'application/mpeg',
  MOV = 'video/quicktime',
}

export const ENUM_FILE_MIME = {
  ...ENUM_FILE_MIME_IMAGE,
  ...ENUM_FILE_MIME_DOCUMENT,
  ...ENUM_FILE_MIME_EXCEL,
  ...ENUM_FILE_MIME_AUDIO,
  ...ENUM_FILE_MIME_VIDEO,
}

export type ENUM_FILE_DISPOSITION = 'attachment' | 'inline'

export type ENUM_FILE_MIME =
  | ENUM_FILE_MIME_IMAGE
  | ENUM_FILE_MIME_DOCUMENT
  | ENUM_FILE_MIME_EXCEL
  | ENUM_FILE_MIME_AUDIO
  | ENUM_FILE_MIME_VIDEO

export enum ENUM_FILE_TYPE_EXCEL {
  XLSX = 'xlsx',
  CSV = 'csv',
}
