import { useRef, useState, type ChangeEvent } from 'react'
import Modal from './Modal'
import { parseStudentFile } from '../lib/importStudents'

export default function ImportStudentsModal({
  onClose,
  onImport,
}: {
  onClose: () => void
  onImport: (names: string[]) => void
}) {
  const [names, setNames] = useState<string[]>([])
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setFileName(file.name)
    try {
      const parsed = await parseStudentFile(file)
      if (parsed.length === 0) {
        setError('No se encontraron nombres en el archivo. Revisa que tenga una columna con los nombres de los estudiantes.')
        setNames([])
        return
      }
      setNames(parsed)
    } catch {
      setError('No se pudo leer el archivo. Asegúrate de que sea un Excel (.xlsx) o CSV válido.')
      setNames([])
    }
  }

  function updateName(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)))
  }

  function removeRow(index: number) {
    setNames((prev) => prev.filter((_, i) => i !== index))
  }

  function addRow() {
    setNames((prev) => [...prev, ''])
  }

  function handleConfirm() {
    const cleaned = names.map((n) => n.trim()).filter((n) => n.length > 0)
    onImport(cleaned)
  }

  return (
    <Modal title="Importar estudiantes" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg border border-dashed border-slate-300 dark:border-slate-600 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400"
          >
            📄 {fileName || 'Elegir archivo Excel (.xlsx) o CSV'}
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        {names.length > 0 && (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Se detectaron <strong>{names.length}</strong> estudiantes. Revisa y corrige si algo no quedó bien antes de
              importar — el número de lista será el orden en que aparecen aquí.
            </p>

            <ul className="flex max-h-64 flex-col gap-1.5 overflow-y-auto pr-1">
              {names.map((name, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateName(i, e.target.value)}
                    className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                    aria-label={`Quitar ${name || 'fila'}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={addRow}
              className="self-start text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              + Agregar fila
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="mt-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800"
            >
              Importar {names.filter((n) => n.trim()).length} estudiantes
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
