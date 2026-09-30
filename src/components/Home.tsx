import { useRef, useState, type ChangeEvent, type MouseEvent } from 'react'
import type { SchoolClass } from '../types'
import { createClass, deleteClass, exportBackup, importBackup, todayISO, type Backup } from '../lib/storage'
import { formatDate } from '../lib/dates'
import CreateClassModal from './CreateClassModal'

export default function Home({
  classes,
  onOpenClass,
  onOpenToday,
  onClassesChanged,
}: {
  classes: SchoolClass[]
  onOpenClass: (classId: string) => void
  onOpenToday: (classId: string) => void
  onClassesChanged: () => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleCreate(input: { name: string; grade: string; studentCount: number; studentNames?: Record<number, string> }) {
    createClass(input)
    setShowCreate(false)
    onClassesChanged()
  }

  function handleDelete(cls: SchoolClass, e: MouseEvent) {
    e.stopPropagation()
    if (confirm(`¿Eliminar "${cls.name}"? Se borrará también toda su bitácora. Esta acción no se puede deshacer.`)) {
      deleteClass(cls.id)
      onClassesChanged()
    }
  }

  function handleExport() {
    const backup = exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aula-backup-${backup.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Backup
        if (!Array.isArray(data.classes) || !Array.isArray(data.sessions)) {
          throw new Error('Formato inválido')
        }
        if (confirm('Esto reemplazará todos los datos actuales con los del respaldo. ¿Continuar?')) {
          importBackup(data)
          onClassesChanged()
        }
      } catch {
        alert('No se pudo leer el archivo de respaldo.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {classes.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Hoy · {formatDate(todayISO())}
          </h2>
          <ul className="flex flex-col gap-2">
            {classes.map((cls) => (
              <li key={cls.id}>
                <button
                  type="button"
                  onClick={() => onOpenToday(cls.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left hover:border-indigo-300 dark:hover:border-indigo-700"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{cls.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{cls.grade}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white">
                    Entrar →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mis clases</h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800"
        >
          + Nueva clase
        </button>
      </header>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Aún no tienes clases. Crea la primera para empezar a llevar tu bitácora.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {classes.map((cls) => (
            <li key={cls.id}>
              <button
                type="button"
                onClick={() => onOpenClass(cls.id)}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-4 text-left shadow-sm hover:border-indigo-300 hover:shadow-md dark:hover:border-indigo-700"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{cls.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {cls.grade} · {cls.studentCount} estudiantes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDelete(cls, e)}
                    className="rounded-full p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 dark:text-slate-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    aria-label={`Eliminar ${cls.name}`}
                  >
                    🗑️
                  </span>
                  <span className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400">→</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 flex items-center justify-center gap-4 text-sm text-slate-400 dark:text-slate-500">
        <button type="button" onClick={handleExport} className="hover:text-slate-600 dark:hover:text-slate-300 underline">
          Exportar respaldo
        </button>
        <span>·</span>
        <button type="button" onClick={handleImportClick} className="hover:text-slate-600 dark:hover:text-slate-300 underline">
          Importar respaldo
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
      </div>

      {showCreate && <CreateClassModal classes={classes} onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  )
}
