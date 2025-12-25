import { BadRequestException, Injectable } from '@nestjs/common'
import * as archiver from 'archiver'
import bytes from 'bytes'
import { CellValue, Workbook } from 'exceljs'
import ffmpeg from 'fluent-ffmpeg'
import * as fs from 'fs'
import { stat } from 'fs/promises'
import imageSize from 'image-size'
import { FileUtil, ROOT_PATH } from 'lib/nest-core'
import { dirname, extname, join, relative } from 'path'
import PDFDocument from 'pdfkit'
import RangeParser, { Range } from 'range-parser'
import { PassThrough, Readable } from 'stream'
import { v7 as uuidv7 } from 'uuid'
import { IFile, IFileRange, IFileReadOptions, IFileRows, IFileZipOptions } from '../interfaces'

@Injectable()
export class FileService {
  async writeCsv<T = any>(rows: IFileRows<T>): Promise<Buffer> {
    // Create a new workbook and add a worksheet
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet(rows.sheetName || 'Sheet 1')

    // Set the headers if provided
    if (rows.headers) {
      worksheet.columns = rows.headers.map((header) => ({
        header,
        key: header,
        width: header.length + 2, // Adjust width based on header length (optional)
      }))
    }

    // Add rows to the worksheet
    rows.data.forEach((row) => {
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
        worksheet.columns = row.headers.map((header) => ({
          header,
          key: header,
          width: header.length + 2, // Adjust width based on header length (optional)
        }))
      }

      // Add data rows to the worksheet
      row.data.forEach((dataRow) => {
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

  async readCsv(file: IFile): Promise<IFileRows> {
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

  async readExcel(file: IFile, _options?: IFileReadOptions): Promise<IFileRows[]> {
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
    workbook.worksheets.forEach((worksheet) => {
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

  convertToStream(data: Buffer): Readable {
    const stream = new Readable()

    // Push the binary data to the readable stream
    stream.push(data)
    stream.push(null) // Signal the end of the stream

    return stream
  }

  convertToBytes(megabytes: string): number {
    return bytes(megabytes)
  }

  createJson(path: string, data: Record<string, any>[]): boolean {
    const sData = JSON.stringify(data)
    fs.writeFileSync(path, sData)

    return true
  }

  readJson(path: string): Record<string, any>[] {
    const data: string = fs.readFileSync(path, 'utf8')
    return JSON.parse(data)
  }

  readText(path: string): string {
    const text: string = fs.readFileSync(path, 'utf8')
    return text
  }

  readBuffer(path: string): Buffer {
    const buffer: Buffer = fs.readFileSync(path)
    return buffer
  }

  writeBuff(path: string, buff: Buffer): string {
    fs.writeFileSync(path, buff)
    return path
  }

  async checkLink(path: string): Promise<string> {
    try {
      if (fs.existsSync(path)) {
        return path
      }
    } catch {}
    return null
  }

  async unlink(path: string): Promise<boolean> {
    if (path) {
      try {
        fs.unlinkSync(path)
      } catch (err: any) {
        if (err?.code !== 'ENOENT') {
          throw err
        }
      }
    }
    return true
  }

  fullLink(path: string): string {
    const fullPath = join(process.cwd(), path)
    return fullPath
  }

  ensureLink(path: string): boolean {
    const dir = dirname(path)
    if (fs.existsSync(dir)) {
      return true
    }
    fs.mkdirSync(dir)
    return this.ensureLink(dir)
  }

  async getReadStreamBytes(path: string, range?: string): Promise<IFileRange> {
    const filePath = join(process.cwd(), path)
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
      readstream = fs.createReadStream(filePath, { start, end })
      contentRange = `bytes ${start}-${end}/${fileSize}`
    } else {
      contentLength = fileSize
      readstream = fs.createReadStream(filePath)
    }

    return { readstream, contentLength, contentRange }
  }

  async writePdf(
    filePath: string,
    options?: any,
  ): Promise<{ pdf: typeof PDFDocument; filePath: string }> {
    const doc = new PDFDocument(options)

    // Pipe the PDF output to a file
    const publicPath = `public/pdfs/${filePath}`
    const fullPath = `${ROOT_PATH}/${publicPath}`
    this.ensureLink(fullPath)

    // cspell:disable
    const regularPath = `${ROOT_PATH}/public/static/fonts/NotoSansCJKtc-Regular.otf`
    const boldPath = `${ROOT_PATH}/public/static/fonts/NotoSansCJKtc-Bold.otf`
    doc.registerFont('Bold', boldPath)
    doc.registerFont('Regular', regularPath)
    // cspell:enable

    doc.pipe(fs.createWriteStream(fullPath))

    // Fonts and Styles
    doc.font('Regular')

    return { pdf: doc, filePath: publicPath }
  }

  async savePdf(doc: typeof PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const bufferStream = new PassThrough() // A stream to collect the data into a buffer
      const buffers: Buffer[] = []

      // Pipe the PDF document output into the PassThrough stream
      doc.pipe(bufferStream)

      // Collect chunks into the `buffers` array
      bufferStream.on('data', (chunk) => {
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

  async handleHEVC(filePath: string, outputPath?: string): Promise<boolean> {
    if (!outputPath) {
      const fileExtension = FileUtil.parseExtension(filePath)
      outputPath = join(ROOT_PATH, 'public', 'temporary', `${uuidv7()}.${fileExtension}`)
    }

    // cspell:disable
    try {
      console.log(`Conversing ${filePath}`)
      ffmpeg(filePath)
        .output(outputPath)
        .videoCodec('libx264') // Convert H.265 to H.264
        .audioCodec('aac') // Keep AAC audio
        .outputOptions(['-preset fast', '-crf 23', '-movflags +faststart'])
        .on('end', () => {
          console.log('Conversion completed. Replacing original file...')

          // Replace original file with converted file
          if (filePath !== outputPath) {
            fs.rename(outputPath, filePath, (err) => {
              if (err) {
                throw err
              } else {
                console.log('File successfully replaced with H.264 version.')
              }
            })
          }
        })
        .on('error', (err) => {
          if (filePath !== outputPath) {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath)
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

  async zipFiles(files: string[], options: IFileZipOptions): Promise<string> {
    const { zipFilePath, zipFileRelative, ...zipFileOpts } = options

    // Ensure the output directory exists
    this.ensureLink(zipFilePath)

    const defaultOpts: archiver.ArchiverOptions = { zlib: { level: 1 } }

    return new Promise(async (resolve, reject) => {
      // Create a write stream for the output ZIP file
      const output = fs.createWriteStream(zipFilePath)
      const archive = archiver.create('zip', { ...defaultOpts, ...zipFileOpts })

      // Handle stream events
      output.on('close', () => {
        resolve(zipFilePath)
      })

      output.on('error', (err) => {
        console.error(`Error while creating ZIP file: ${err.message}`)
        reject(err)
      })

      // Pipe the archive data to the file stream
      archive.pipe(output)

      // Add files to the archive
      for (const filePath of files) {
        if (fs.existsSync(filePath)) {
          const fileStream = fs.createReadStream(filePath)
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

  directories(root: string, path: string = '', recursiveLevel: number = 0): any[] {
    const directory = `${root}/${path}/`.replace('//', '/').replace(/^\/+|\/+$/g, '')
    this.ensureLink(`${directory}/test.txt`)

    const directories = []
    function traverseDir(currentPath: string, level: number = 0) {
      const items = fs.readdirSync(currentPath, { withFileTypes: true })

      for (const item of items) {
        const fullPath = join(currentPath, item.name)
        const isDirectory = item.isDirectory()
        const isFile = item.isFile()

        if (!isDirectory && !isFile) continue

        let fileWidth: number = null
        let fileHeight: number = null
        if (isFile) {
          try {
            const buffer = fs.readFileSync(fullPath)
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
          size: isDirectory ? null : fs.statSync(fullPath).size,
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

  async remove(path: string): Promise<boolean> {
    if (path) {
      try {
        const stats = fs.statSync(path)

        if (stats.isDirectory()) {
          fs.rmSync(path, { recursive: true, force: true })
        } else if (stats.isFile()) {
          fs.unlinkSync(path)
        }
        return true
      } catch (err: any) {
        if (err?.code !== 'ENOENT') {
          throw err
        }
      }
    }
    return false
  }

  async stats(path: string) {
    try {
      const filePath = join(process.cwd(), path)
      const stats = await stat(filePath)
      return stats
    } catch {}
    return null
  }
}
