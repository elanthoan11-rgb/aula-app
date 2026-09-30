import * as XLSX from 'xlsx'

const HEADER_KEYWORDS = ['n°', 'nro', 'no.', 'numero', 'número', 'código', 'codigo', 'apellido', 'nombre', 'alumno', 'estudiante', 'dni']

function looksLikeHeader(cells: string[]): boolean {
  const joined = cells.join(' ').toLowerCase()
  return HEADER_KEYWORDS.some((kw) => joined.includes(kw))
}

function isPureNumber(value: string): boolean {
  return /^\d+$/.test(value.trim())
}

function rowsToNames(rows: unknown[][]): string[] {
  const cleanRows = rows
    .map((row) => row.map((cell) => String(cell ?? '').trim()).filter((cell) => cell.length > 0))
    .filter((row) => row.length > 0)

  if (cleanRows.length === 0) return []

  const dataRows = looksLikeHeader(cleanRows[0]) ? cleanRows.slice(1) : cleanRows

  return dataRows
    .map((row) => row.filter((cell) => !isPureNumber(cell)).join(' ').trim())
    .filter((name) => name.length > 0)
}

export async function parseStudentFile(file: File): Promise<string[]> {
  const lowerName = file.name.toLowerCase()

  if (lowerName.endsWith('.csv')) {
    const text = await file.text()
    const rows = text
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => line.split(/[,;\t]/))
    return rowsToNames(rows)
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []
  const sheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 })
  return rowsToNames(rows)
}
