import { useMemo, useState } from 'react'
import type { ClassSession, IncidentTypeId, SchoolClass } from '../types'
import { INCIDENT_TYPES, MAX_INCIDENT_LEVEL } from '../types'
import { addCleanupHelp, addParticipation, incrementIncident, resetIncident, setStudentName, todayISO } from '../lib/storage'
import { formatDate } from '../lib/dates'
import PrintableSession from './PrintableSession'

export default function SessionView({
  cls,
  session: initialSession,
  onBack,
  onSessionChanged,
}: {
  cls: SchoolClass
  session: ClassSession
  onBack: () => void
  onSessionChanged: () => void
}) {
  const [session, setSession] = useState(initialSession)
  const [studentNames, setStudentNames] = useState(cls.studentNames)
  const [editingNumber, setEditingNumber] = useState<number | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [onlyWithIncidents, setOnlyWithIncidents] = useState(false)

  const students = useMemo(() => Array.from({ length: cls.studentCount }, (_, i) => i + 1), [cls.studentCount])

  const studentHasIncidents = (n: number) => Object.keys(session.records[n] ?? {}).length > 0
  const clearCount = students.filter((n) => !studentHasIncidents(n)).length

  function handleIncrement(studentNumber: number, incidentId: IncidentTypeId) {
    const updated = incrementIncident(session.id, studentNumber, incidentId)
    if (updated) setSession(updated)
    onSessionChanged()
  }

  function handleReset(studentNumber: number, incidentId: IncidentTypeId) {
    const updated = resetIncident(session.id, studentNumber, incidentId)
    if (updated) setSession(updated)
    onSessionChanged()
  }

  function handleParticipation(studentNumber: number, delta: number) {
    const updated = addParticipation(session.id, studentNumber, delta)
    if (updated) setSession(updated)
    onSessionChanged()
  }

  function handleCleanupHelp(studentNumber: number, delta: number) {
    const updated = addCleanupHelp(session.id, studentNumber, delta)
    if (updated) setSession(updated)
    onSessionChanged()
  }

  function startRename(studentNumber: number) {
    setEditingNumber(studentNumber)
    setNameDraft(studentNames[studentNumber] ?? '')
  }

  function saveRename(studentNumber: number) {
    setStudentName(cls.id, studentNumber, nameDraft)
    setStudentNames((prev) => {
      const next = { ...prev }
      if (nameDraft.trim()) next[studentNumber] = nameDraft.trim()
      else delete next[studentNumber]
      return next
    })
    setEditingNumber(null)
  }

  const visibleStudents = onlyWithIncidents ? students.filter((n) => studentHasIncidents(n)) : students

  return (
    <>
    <div className="mx-auto max-w-4xl px-4 py-6 pb-16 print:hidden">
      <header className="mb-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← {cls.name}
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {formatDate(session.date)}
              {session.date === todayISO() && (
                <span className="ml-2 rounded-full bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 align-middle">
                  Hoy
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {clearCount} de {cls.studentCount} sin incidencias
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            🖨️ Imprimir / PDF
          </button>
        </div>
      </header>

      <label className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={onlyWithIncidents}
          onChange={(e) => setOnlyWithIncidents(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        Mostrar solo estudiantes con incidencias
      </label>

      <ul className="flex flex-col gap-2">
        {visibleStudents.map((n) => {
          const active = session.records[n] ?? {}
          const hasIncidents = Object.keys(active).length > 0
          const name = studentNames[n]
          const participationCount = session.participation[n] ?? 0
          const cleanupHelpCount = session.cleanupHelp[n] ?? 0

          return (
            <li
              key={n}
              className={`rounded-xl border p-3 transition-colors ${
                hasIncidents
                  ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    hasIncidents
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  }`}
                >
                  {n}
                </span>

                {editingNumber === n ? (
                  <input
                    autoFocus
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={() => saveRename(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(n)
                      if (e.key === 'Escape') setEditingNumber(null)
                    }}
                    placeholder="Nombre (opcional)"
                    className="flex-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startRename(n)}
                    className="flex-1 truncate text-left text-sm text-slate-600 dark:text-slate-300"
                  >
                    {name ?? <span className="text-slate-400 dark:text-slate-500">Estudiante {n} · añadir nombre</span>}
                  </button>
                )}
              </div>

              <div className="mb-2 flex flex-wrap gap-1.5">
                {INCIDENT_TYPES.map((type) => {
                  const count = active[type.id] ?? 0
                  const level = Math.min(count, MAX_INCIDENT_LEVEL)
                  const levelClasses =
                    level === 0
                      ? 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
                      : level === 1
                        ? 'border-yellow-400 bg-yellow-400 text-slate-900'
                        : level === 2
                          ? 'border-orange-700 bg-orange-700 text-white'
                          : 'border-rose-600 bg-rose-600 text-white'

                  return (
                    <span key={type.id} className="inline-flex overflow-hidden rounded-md">
                      <button
                        type="button"
                        onClick={() => handleIncrement(n, type.id)}
                        className={`flex items-center gap-1 border px-2 py-1.5 text-xs font-medium transition-colors ${levelClasses} ${
                          count > 0 ? 'border-r-black/10 dark:border-r-white/20' : ''
                        }`}
                        aria-pressed={count > 0}
                        title={count > 0 ? `${type.description} · ${count} ${count === 1 ? 'vez' : 'veces'}` : type.description}
                      >
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                        {count > 1 && <span className="font-bold">×{count}</span>}
                      </button>
                      {count > 0 && (
                        <button
                          type="button"
                          onClick={() => handleReset(n, type.id)}
                          className={`flex items-center justify-center border px-1.5 text-xs font-bold ${levelClasses}`}
                          aria-label={`Quitar incidencia ${type.label} de estudiante ${n}`}
                          title="Quitar"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                <span className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">🙋 Participación activa</span>
                <button
                  type="button"
                  onClick={() => handleParticipation(n, -1)}
                  disabled={!participationCount}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 disabled:opacity-30"
                  aria-label={`Restar participación a estudiante ${n}`}
                >
                  −
                </button>
                <span className="min-w-[2rem] rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 text-center text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {participationCount}
                </span>
                <button
                  type="button"
                  onClick={() => handleParticipation(n, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                  aria-label={`Sumar participación a estudiante ${n}`}
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                <span className="flex-1 text-xs font-medium text-slate-500 dark:text-slate-400">🧹 Ayuda con la limpieza</span>
                <button
                  type="button"
                  onClick={() => handleCleanupHelp(n, -1)}
                  disabled={!cleanupHelpCount}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 disabled:opacity-30"
                  aria-label={`Restar ayuda con la limpieza a estudiante ${n}`}
                >
                  −
                </button>
                <span className="min-w-[2rem] rounded-md bg-sky-50 dark:bg-sky-950/40 px-2 py-1 text-center text-sm font-bold tabular-nums text-sky-700 dark:text-sky-300">
                  {cleanupHelpCount}
                </span>
                <button
                  type="button"
                  onClick={() => handleCleanupHelp(n, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-sky-500 bg-sky-500 text-white hover:bg-sky-600"
                  aria-label={`Sumar ayuda con la limpieza a estudiante ${n}`}
                >
                  +
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {visibleStudents.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Nadie tiene incidencias registradas todavía. 🎉
        </div>
      )}
    </div>
    <PrintableSession cls={cls} session={session} studentNames={studentNames} />
    </>
  )
}
