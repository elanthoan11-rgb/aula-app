import { lazy, Suspense, useState, type FormEvent } from 'react'
import type { SchoolClass } from '../types'
import Modal from './Modal'

const ImportStudentsModal = lazy(() => import('./ImportStudentsModal'))

export default function CreateClassModal({
  classes,
  onClose,
  onCreate,
}: {
  classes: SchoolClass[]
  onClose: () => void
  onCreate: (input: { name: string; grade: string; studentCount: number; studentNames?: Record<number, string> }) => void
}) {
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [studentCount, setStudentCount] = useState('')
  const [sourceClassId, setSourceClassId] = useState('')
  const [importedNames, setImportedNames] = useState<string[] | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [error, setError] = useState('')

  function handleImport(names: string[]) {
    setImportedNames(names)
    setSourceClassId('')
    setStudentCount(String(names.length))
    setShowImport(false)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const count = Number(studentCount)
    if (!name.trim()) {
      setError('Ponle un nombre a la clase.')
      return
    }
    if (!grade.trim()) {
      setError('Indica el grado.')
      return
    }
    if (!Number.isInteger(count) || count < 1 || count > 200) {
      setError('La cantidad de estudiantes debe ser un número entre 1 y 200.')
      return
    }

    let studentNames: Record<number, string> | undefined
    if (importedNames) {
      studentNames = {}
      importedNames.forEach((studentName, i) => {
        const num = i + 1
        if (num <= count) studentNames![num] = studentName
      })
    } else {
      const source = classes.find((c) => c.id === sourceClassId)
      if (source) {
        studentNames = {}
        for (const [numStr, studentName] of Object.entries(source.studentNames)) {
          const num = Number(numStr)
          if (num <= count) studentNames[num] = studentName
        }
      }
    }

    onCreate({ name, grade, studentCount: count, studentNames })
  }

  return (
    <Modal title="Nueva clase" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Nombre de la clase
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Matemáticas 8-A"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Grado
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="Ej. 8vo grado"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Cantidad de estudiantes
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={200}
            value={studentCount}
            onChange={(e) => setStudentCount(e.target.value)}
            placeholder="Ej. 35"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          />
        </label>

        {classes.length > 0 && (
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Copiar estudiantes de una clase existente (opcional)
            <select
              value={sourceClassId}
              onChange={(e) => {
                setSourceClassId(e.target.value)
                if (e.target.value) setImportedNames(null)
              }}
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
            >
              <option value="">Ninguna, crear lista vacía</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.grade})
                </option>
              ))}
            </select>
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
              Copia los nombres ya asignados por número de estudiante.
            </span>
          </label>
        )}

        <div>
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            📥 Importar lista desde Excel/CSV
          </button>
          {importedNames && (
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              {importedNames.length} estudiantes importados y listos para crear la clase.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800"
        >
          Crear clase
        </button>
      </form>

      {showImport && (
        <Suspense fallback={null}>
          <ImportStudentsModal onClose={() => setShowImport(false)} onImport={handleImport} />
        </Suspense>
      )}
    </Modal>
  )
}
