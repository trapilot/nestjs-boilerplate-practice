import { BadRequestException } from '@nestjs/common'
import archiver from 'archiver'
import bytes from 'bytes'
import { CellValue, Workbook } from 'exceljs'
import Ffmpeg from 'fluent-ffmpeg'
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rename,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs'
import { stat, unlink } from 'fs/promises'
import imageSize from 'image-size'
import * as mime from 'mime'
import { basename, dirname, extname, join, relative } from 'path'
import PDFDocument from 'pdfkit'
import RangeParser, { Range } from 'range-parser'
import { PassThrough, Readable } from 'stream'
import { v7 as uuidv7 } from 'uuid'
import { APP_PATH, ROOT_PATH } from '../constants'
import {
  IFile,
  IFileFormatOptions,
  IFileRange,
  IFileReadOptions,
  IFileRows,
  IFileZipOptions,
} from '../interfaces'
import { ArrUtil } from './array.util'

export class FileUtil {
  static format(fileName: string, options?: IFileFormatOptions): string {
    const [name, ext] = fileName
      .replace(/ /g, '_')
      .replace(/^0-9a-zA-Z_.-/g, '')
      .split(/(\.[^.]+)$/)

    const parts = [name]
    if (options?.timestamp || name.length === 0) {
      parts.push(new Date().getTime().toString())
    }
    if (options?.suffix) {
      parts.push(options.suffix)
    }

    const _fileName = ArrUtil.join(parts, { delimiter: '_', allowEmpty: false })
    const _fileExtension = options?.extension ? `.${options.extension}` : ext

    return _fileName + _fileExtension
  }

  static kilobytes(val: number) {
    return bytes(`${val}kb`)
  }

  static megabytes(val: number) {
    return bytes(`${val}mb`)
  }

  static relative(from: string, to: string): string {
    return relative(from, to)
  }

  static normalize(path: string): string {
    return path.replaceAll('\\', '/')
  }

  static basename(path: string, suffix?: string): string {
    return basename(path, suffix)
  }

  static join(args: string[]): string {
    return join(...args)
  }

  static joinRoot(args: string[]): string {
    return join(ROOT_PATH, ...args)
  }

  static joinApp(args: string[]): string {
    return join(APP_PATH, ...args)
  }

  static isVideo(file: IFile): boolean {
    return file.mimetype.startsWith('video/')
  }

  static isImage(file: IFile): boolean {
    return file.mimetype.startsWith('image/')
  }

  static isHighEfficiency(fileName: string): [extension: string, heiFlg: boolean, hevFlg: boolean] {
    const fileExt = this.extractExtensionFromFilename(fileName)
    const fileMime = this.extractMimeFromFilename(fileName)
    if (['heic', 'heif'].includes(fileMime) || ['.heic', '.heif'].includes(fileExt)) {
      return [fileExt, true, false]
    }
    if (['h265', 'hevc'].includes(fileMime) || ['.h265', '.hevc'].includes(fileExt)) {
      return [fileExt, false, true]
    }

    // MP4(H.265) files won't work in Firefox
    /*
    if ('mp4' === fileMime || '.mp4' === fileExt) {
      return [fileExt, false, true]
    }
    */
    return [fileExt, false, false]
  }

  static async calculateTotalSize(files: string[]): Promise<number> {
    let totalSize = 0
    for (const filePath of files) {
      try {
        const stats = await stat(filePath)
        totalSize += stats.size
      } catch {
        console.warn(`File not found for size calculation: ${filePath}`)
      }
    }
    return totalSize
  }

  static extractExtensionFromFilename(filename: string): string {
    return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase()
  }

  static extractMimeFromFilename(filename: string): string {
    return mime.getType(this.extractExtensionFromFilename(filename))
  }

  static extractFilenameFromPath(filePath: string): string {
    const parts = filePath.split('/')
    return parts[parts.length - 1]
  }

  static getTemplate(fileName: string, language?: string): string {
    return language
      ? join(APP_PATH, 'resources', 'templates', language, fileName)
      : join(APP_PATH, 'resources', 'templates', fileName)
  }

  static readTemplate(fileName: string, language?: string): string {
    const filePath = this.getTemplate(fileName, language)
    return this.readText(filePath)
  }

  async writeCsv<T = any>(rows: IFileRows<T>): Promise<Buffer> {
    // Create a new workbook and add a worksheet
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet(rows.sheetName || 'Sheet 1')

    // Set the headers if provided
    if (rows.headers) {
      worksheet.columns = rows.headers.map(header => ({
        header,
        key: header,
        width: header.length + 2, // Adjust width based on header length (optional)
      }))
    }

    // Add rows to the worksheet
    rows.data.forEach(row => {
      worksheet.addRow(row)
    })

    // Write the workbook to a CSV buffer
    const csvBuffer = await workbook.csv.writeBuffer()

    return Buffer.from(csvBuffer)
  }

  async writeExcel<T = any>(rows: IFileRows<T>[], options?: IFileReadOptions): Promise<Buffer> {
    // Create a new workbook using ExcelJS
    const workbook = new Workbook()

    // Iterate over each row and add a new worksheet
    for (const [index, row] of rows.entries()) {
      // Create a new worksheet
      const worksheet = workbook.addWorksheet(row.sheetName || `Sheet${index + 1}`)

      // Add headers if provided
      if (row.headers) {
        worksheet.columns = row.headers.map(header => ({
          header,
          key: header,
          width: header.length + 2, // Adjust width based on header length (optional)
        }))
      }

      // Add data rows to the worksheet
      row.data.forEach(dataRow => {
        worksheet.addRow(dataRow)
      })
    }

    // Write the workbook to a buffer (XLSX format)
    const buffer = await workbook.xlsx.writeBuffer()

    // Optional: Apply password protection to the file (if provided in options)
    if (options?.password) {
      // ExcelJS doesn't natively support password protection in XLSX files.
      // You would need an additional library like `xlsx-populate` or `js-xlsx-encrypt` to handle encryption.
      // Alternatively, you could save the file and encrypt it separately using other tools.
    }

    return Buffer.from(buffer)
  }

  static async readCsv(file: IFile): Promise<IFileRows> {
    // Create a new workbook
    const workbook = new Workbook()

    // Convert Buffer to Readable Stream
    const stream = this.convertToStream(file.buffer)

    // Read the file buffer into the workbook
    await workbook.csv.read(stream)

    // Get the first sheet (assuming there's only one sheet)
    const worksheet = workbook.worksheets[0]
    const sheetName = worksheet.name

    // Parse the rows into an array of records
    const rows: Record<string, CellValue | string | number | Date>[] = []

    worksheet.eachRow((row, rowNumber) => {
      // For the first row, use it as the header
      if (rowNumber === 1) {
        return // Skip header row for now, handled below
      }

      // For each row, convert to a record (key-value pair based on the header)
      const rowData: Record<string, CellValue | string | number | Date> = {}
      worksheet.getRow(1).eachCell((_cell, colNumber) => {
        const header = worksheet.getCell(1, colNumber).value as string
        const cellValue = row.getCell(colNumber).value
        rowData[header] = cellValue
      })

      rows.push(rowData)
    })

    // Return the parsed data in the IFileRows format
    return { data: rows, sheetName }
  }

  static async readExcel(file: IFile, _options?: IFileReadOptions): Promise<IFileRows[]> {
    // Create a new workbook instance
    const workbook = new Workbook()

    // Convert Buffer to ArrayBuffer (standard Node.js Buffer)
    const fileBuffer = file.buffer as Buffer
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.length,
    )

    // Read the buffer into the workbook (consider password protection)
    await workbook.xlsx.load(arrayBuffer as ArrayBuffer)

    // Create an array to hold sheets
    const sheets: IFileRows[] = []

    // Iterate over all worksheets in the workbook
    workbook.worksheets.forEach(worksheet => {
      const sheetName = worksheet.name

      // Parse rows from the worksheet
      const rows: Record<string, CellValue | string | number | Date>[] = []

      // Get headers (first row of the worksheet)
      const headers = (worksheet.getRow(1).values as Array<string>).slice(1) as string[] // Skip the first empty entry in the `values` array

      // Iterate over the rows (starting from row 2 to skip headers)
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        // Skip header row (if rowNumber is 1)
        if (rowNumber === 1) return

        // Create a row object mapping header keys to cell values
        const rowData: Record<string, CellValue | string | number | Date> = {}
        headers.forEach((header, colIndex) => {
          const cell = row.getCell(colIndex + 1) // ExcelJS uses 1-based indexing for columns
          rowData[header] = cell.value
        })

        rows.push(rowData)
      })

      // Push the sheet data into the `sheets` array
      sheets.push({ data: rows, sheetName })
    })

    return sheets
  }

  static convertToStream(data: Buffer): Readable {
    const stream = new Readable()

    // Push the binary data to the readable stream
    stream.push(data)
    stream.push(null) // Signal the end of the stream

    return stream
  }

  static convertToBytes(megabytes: string): number {
    return bytes(megabytes)
  }

  static createJson(path: string, data: Record<string, any>[]): boolean {
    const sData = JSON.stringify(data)
    writeFileSync(path, sData)

    return true
  }

  static readJson(path: string): Record<string, any>[] {
    const data: string = readFileSync(path, 'utf8')
    return JSON.parse(data)
  }

  static readText(path: string): string {
    const text: string = readFileSync(path, 'utf8')
    return text
  }

  static readBuffer(path: string): Buffer {
    const buffer: Buffer = readFileSync(path)
    return buffer
  }

  static writeBuff(path: string, buff: Buffer): string {
    writeFileSync(path, buff)
    return path
  }

  static async removeLink(path: string): Promise<boolean> {
    try {
      await unlink(path)
      return true
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        return true
      }
      throw err
    }
  }

  static ensureLink(path: string): boolean {
    const dir = dirname(path)
    if (existsSync(dir)) {
      return true
    }
    mkdirSync(dir)
    return this.ensureLink(dir)
  }

  static async getReadStreamBytes(path: string, range?: string): Promise<IFileRange> {
    const filePath = FileUtil.join([process.cwd(), path])
    const stats = await stat(filePath)
    const fileSize = stats.size

    // stream response
    let contentRange = null
    let contentLength = 0
    let readstream = null

    if (range) {
      const results = RangeParser(fileSize, range)
      if (results === -1 || results === -2 || results.length !== 1) {
        throw new BadRequestException()
      }

      const { start, end } = results[0] as Range
      contentLength = (end ? end : fileSize) - start
      readstream = createReadStream(filePath, { start, end })
      contentRange = `bytes ${start}-${end}/${fileSize}`
    } else {
      contentLength = fileSize
      readstream = createReadStream(filePath)
    }

    return { readstream, contentLength, contentRange }
  }

  static async writePdf(
    fileName: string,
    options?: any,
  ): Promise<{ pdf: typeof PDFDocument; filePath: string }> {
    const doc = new PDFDocument(options)

    const filePath = FileUtil.join(['public', 'pdfs', fileName])

    // Pipe the PDF output to a file
    const fontPath = FileUtil.joinRoot(['public', 'static', 'fonts'])
    const fullPath = FileUtil.joinRoot([filePath])

    // cspell:disableO
    doc.registerFont('Bold', FileUtil.join([fontPath, 'NotoSansCJKtc-Bold.otf']))
    doc.registerFont('Regular', FileUtil.join([fontPath, 'NotoSansCJKtc-Regular.otf']))
    // cspell:enable

    this.ensureLink(fullPath)
    doc.pipe(createWriteStream(fullPath))

    // Fonts and Styles
    doc.font('Regular')

    return { pdf: doc, filePath: filePath }
  }

  static async savePdf(doc: typeof PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const bufferStream = new PassThrough() // A stream to collect the data into a buffer
      const buffers: Buffer[] = []

      // Pipe the PDF document output into the PassThrough stream
      doc.pipe(bufferStream)

      // Collect chunks into the `buffers` array
      bufferStream.on('data', chunk => {
        buffers.push(chunk)
      })

      // When the document finishes writing, resolve the Promise with the full buffer
      bufferStream.on('end', () => {
        resolve(Buffer.concat(buffers))
      })

      // If an error occurs, reject the Promise
      bufferStream.on('error', reject)

      // Finalize the document
      doc.end()
    })
  }

  static async handleHEVC(filePath: string, outputPath?: string): Promise<boolean> {
    if (!outputPath) {
      const fileExtension = FileUtil.extractExtensionFromFilename(filePath)
      outputPath = FileUtil.joinRoot(['public', 'temporary', `${uuidv7()}.${fileExtension}`])
    }

    // cspell:disable
    try {
      console.log(`Conversing ${filePath}`)
      Ffmpeg(filePath)
        .output(outputPath)
        .videoCodec('libx264') // Convert H.265 to H.264
        .audioCodec('aac') // Keep AAC audio
        .outputOptions(['-preset fast', '-crf 23', '-movflags +faststart'])
        .on('end', () => {
          console.log('Conversion completed. Replacing original file...')

          // Replace original file with converted file
          if (filePath !== outputPath) {
            rename(outputPath, filePath, err => {
              if (err) {
                throw err
              } else {
                console.log('File successfully replaced with H.264 version.')
              }
            })
          }
        })
        .on('error', err => {
          if (filePath !== outputPath) {
            if (existsSync(outputPath)) {
              unlinkSync(outputPath)
            }
          }
          throw new Error('Error during conversion:', err)
        })
        .run()
    } catch {
      return false
    }
    // cspell:enable

    return true
  }

  static async zipFiles(files: string[], options: IFileZipOptions): Promise<string> {
    const { zipFilePath, zipFileRelative, ...zipFileOpts } = options

    // Ensure the output directory exists
    this.ensureLink(zipFilePath)

    const defaultOpts: archiver.ArchiverOptions = { zlib: { level: 1 } }

    return new Promise(async (resolve, reject) => {
      // Create a write stream for the output ZIP file
      const output = createWriteStream(zipFilePath)
      const archive = archiver.create('zip', { ...defaultOpts, ...zipFileOpts })

      // Handle stream events
      output.on('close', () => {
        resolve(zipFilePath)
      })

      output.on('error', err => {
        console.error(`Error while creating ZIP file: ${err.message}`)
        reject(err)
      })

      // Pipe the archive data to the file stream
      archive.pipe(output)

      // Add files to the archive
      for (const filePath of files) {
        if (existsSync(filePath)) {
          const fileStream = createReadStream(filePath)
          archive.append(fileStream, { name: relative(zipFileRelative, filePath) })
        } else {
          console.warn(`File not found, skipping: ${filePath}`)
        }
      }

      // Finalize the archive
      await archive.finalize()

      return zipFilePath
    })
  }

  static directories(root: string, path: string = '', recursiveLevel: number = 0): any[] {
    const directory = `${root}/${path}/`.replace('//', '/').replace(/^\/+|\/+$/g, '')
    this.ensureLink(`${directory}/test.txt`)

    const directories = []
    function traverseDir(currentPath: string, level: number = 0) {
      const items = readdirSync(currentPath, { withFileTypes: true })

      for (const item of items) {
        const fullPath = FileUtil.join([currentPath, item.name])
        const isDirectory = item.isDirectory()
        const isFile = item.isFile()

        if (!isDirectory && !isFile) continue

        let fileWidth: number = null
        let fileHeight: number = null
        if (isFile) {
          try {
            const buffer = readFileSync(fullPath)
            const dimension = imageSize(buffer)
            fileWidth = dimension?.width
            fileHeight = dimension?.height
          } catch {}
        }

        directories.push({
          level,
          fullPath,
          path: fullPath.replace(`${root}/`, ''),
          type: isDirectory ? 'directory' : 'file',
          size: isDirectory ? null : statSync(fullPath).size,
          width: fileWidth,
          height: fileHeight,
          name: item.name,
          extension: isDirectory ? null : extname(item.name).slice(1) || 'unknown',
        })

        if (isDirectory && recursiveLevel > level) {
          traverseDir(fullPath, level + 1) // Recursively go into subfolders
        }
      }
    }

    traverseDir(directory)
    return directories
  }

  static async stats(path: string) {
    try {
      const filePath = FileUtil.join([process.cwd(), path])
      const stats = await stat(filePath)
      return stats
    } catch {}
    return null
  }
}
