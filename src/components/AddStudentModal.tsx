import { useState, type FormEvent } from 'react'
import Modal from './Modal'

export default function AddStudentModal({
  studentCount,
  onClose,
  onAdd,
}: {
  studentCount: number
  onClose: () => void
  onAdd: (input: { name: string; number: number }) => void
}) {
  const [name, setName] = useState('')
  const [number, setNumber] = useState(String(studentCount + 1))
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const num = Number(number)
    if (!Number.isInteger(num) || num < 1 || num > studentCount + 1) {
      setError(`El número de lista debe ser entre 1 y ${studentCount + 1}.`)
      return
    }
    onAdd({ name, number: num })
  }

  const willShift = Number(number) <= studentCount && Number.isInteger(Number(number))

  return (
    <Modal title="Agregar estudiante" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Nombre (opcional)
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del estudiante"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Número de lista
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={studentCount + 1}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-base text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          />
          <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
            {willShift
              ? 'Los estudiantes desde ese número en adelante pasarán al siguiente número.'
              : `Se agregará al final de la lista (actualmente tiene ${studentCount}).`}
          </span>
        </label>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800"
        >
          Agregar estudiante
        </button>
      </form>
    </Modal>
  )
}
