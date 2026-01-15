/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum EnumFileExtensionImage {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
}

export enum EnumFileExtensionDocument {
  PDF = 'pdf',
  CSV = 'csv',
  XLSX = 'xlsx',
}

export enum EnumFileExtensionTemplate {
  HBS = 'hbs',
  PUG = 'pug',
  EJS = 'ejs',
}

export enum EnumFileExtensionAudio {
  MPEG = 'mpeg',
  M4A = 'm4a',
  MP3 = 'mp3',
}

export enum EnumFileExtensionVideo {
  MP4 = 'mp4',
  MOV = 'mov',
}

export const EnumFileExtension = {
  ...EnumFileExtensionImage,
  ...EnumFileExtensionDocument,
  ...EnumFileExtensionAudio,
  ...EnumFileExtensionVideo,
  ...EnumFileExtensionTemplate,
}

export type EnumFileExtension =
  | EnumFileExtensionImage
  | EnumFileExtensionDocument
  | EnumFileExtensionAudio
  | EnumFileExtensionVideo
  | EnumFileExtensionTemplate
