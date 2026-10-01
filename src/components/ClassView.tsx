import { lazy, Suspense, useState } from 'react'
import type { ClassSession, SchoolClass } from '../types'
import { INCIDENT_TYPES } from '../types'
import { getOrCreateTodaySession, getSessionsForClass, todayISO, updateClass } from '../lib/storage'
import { formatDate } from '../lib/dates'

const ImportStudentsModal = lazy(() => import('./ImportStudentsModal'))

function sessionIncidentCount(session: ClassSession): number {
  return Object.values(session.records).reduce(
    (sum, counts) => sum + Object.values(counts).reduce((s, c) => s + (c ?? 0), 0),
    0,
  )
}

function sessionStudentsWithIncidents(session: ClassSession): number {
  return Object.keys(session.records).length
}

export default function ClassView({
  cls,
  onBack,
  onOpenSession,
  onOpenReport,
  onClassChanged,
}: {
  cls: SchoolClass
  onBack: () => void
  onOpenSession: (sessionId: string) => void
  onOpenReport: () => void
  onClassChanged: () => void
}) {
  const sessions = getSessionsForClass(cls.id)
  const hasToday = sessions.some((s) => s.date === todayISO())
  const [showImport, setShowImport] = useState(false)

  function handleStartToday() {
    const session = getOrCreateTodaySession(cls.id)
    onOpenSession(session.id)
  }

  function handleImport(names: string[]) {
    if (names.length !== cls.studentCount) {
      const proceed = confirm(
        `Tu clase tiene ${cls.studentCount} cupos y el archivo trae ${names.length} estudiantes. Se ajustará la cantidad de estudiantes de la clase a ${names.length}. ¿Continuar?`,
      )
      if (!proceed) return
    } else if (
      !confirm(`Esto reemplazará los nombres actuales por los ${names.length} del archivo. ¿Continuar?`)
    ) {
      return
    }

    const studentNames = Object.fromEntries(names.map((studentName, i) => [i + 1, studentName]))
    updateClass(cls.id, { studentNames, studentCount: names.length })
    setShowImport(false)
    onClassChanged()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← Mis clases
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{cls.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {cls.grade} · {cls.studentCount} estudiantes
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setShowImport(true)}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              📥 Importar
            </button>
            <button
              type="button"
              onClick={onOpenReport}
              className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              📊 Reporte
            </button>
          </div>
        </div>
      </header>

      <button
        type="button"
        onClick={handleStartToday}
        className="mb-8 w-full rounded-xl bg-indigo-600 px-4 py-4 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800"
      >
        {hasToday ? '📝 Continuar clase de hoy' : '▶️ Iniciar clase de hoy'}
      </button>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Bitácora
      </h2>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Todavía no hay sesiones registradas.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {sessions.map((session) => {
            const incidentCount = sessionIncidentCount(session)
            const studentCount = sessionStudentsWithIncidents(session)
            return (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => onOpenSession(session.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-left hover:border-indigo-300 dark:hover:border-indigo-700"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {formatDate(session.date)}
                      {session.date === todayISO() && (
                        <span className="ml-2 rounded-full bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          Hoy
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {incidentCount === 0
                        ? 'Sin incidencias'
                        : `${incidentCount} incidencia${incidentCount === 1 ? '' : 's'} · ${studentCount} estudiante${studentCount === 1 ? '' : 's'}`}
                    </p>
                  </div>
                  <span className="text-slate-300 dark:text-slate-600">→</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
        {INCIDENT_TYPES.length} tipos de incidencia disponibles · Lo que no marques significa que el estudiante trabajó, respetó y estuvo activo.
      </p>

      {showImport && (
        <Suspense fallback={null}>
          <ImportStudentsModal onClose={() => setShowImport(false)} onImport={handleImport} />
        </Suspense>
      )}
    </div>
  )
}
