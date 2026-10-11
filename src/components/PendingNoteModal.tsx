import { useState, type FormEvent } from 'react'
import Modal from './Modal'

const SUGGESTIONS = [
  '¿Qué estudiantes faltan por participar?',
  '¿Quedó algún tema o actividad sin terminar?',
  '¿Hay algo que continuar en la próxima clase?',
  '¿Algún estudiante necesita seguimiento especial?',
]

export default function PendingNoteModal({
  initialNote,
  onClose,
  onSave,
}: {
  initialNote: string
  onClose: () => void
  onSave: (note: string) => void
}) {
  const [note, setNote] = useState(initialNote)
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!note.trim()) {
      setError('Escribe qué queda pendiente antes de guardar.')
      return
    }
    onSave(note)
  }

  return (
    <Modal title="¿Qué queda pendiente?" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-300">
          <p className="mb-1 font-semibold">Ideas para tu nota:</p>
          <ul className="list-inside list-disc space-y-0.5">
            {SUGGESTIONS.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Nota para la próxima clase
          <textarea
            autoFocus
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej. Aún faltan los números del 20 al 26 por participar."
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          />
        </label>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-1 rounded-lg bg-amber-500 px-4 py-2.5 text-base font-semibold text-white hover:bg-amber-600 active:bg-amber-700"
        >
          Guardar y salir
        </button>
      </form>
    </Modal>
  )
}
