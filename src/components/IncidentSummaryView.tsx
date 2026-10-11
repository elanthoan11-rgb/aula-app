import { useMemo } from 'react'
import type { IncidentTypeId, SchoolClass } from '../types'
import { INCIDENT_TYPES } from '../types'
import { getSessionsForClass } from '../lib/storage'

interface StudentIncidentStats {
  number: number
  name?: string
  byType: Record<IncidentTypeId, number>
  total: number
  participation: number
  cleanupHelp: number
}

function incidentCellClasses(count: number): string {
  if (count === 0) return 'text-emerald-600 dark:text-emerald-400'
  if (count <= 2) return 'text-rose-400 dark:text-rose-400 font-semibold'
  if (count <= 5) return 'text-rose-600 dark:text-rose-400 font-bold'
  return 'text-rose-800 dark:text-rose-300 font-bold'
}

function positiveCellClasses(count: number): string {
  if (count === 0) return 'text-slate-300 dark:text-slate-600'
  if (count <= 2) return 'text-emerald-500 dark:text-emerald-400 font-semibold'
  if (count <= 5) return 'text-emerald-600 dark:text-emerald-400 font-bold'
  return 'text-emerald-800 dark:text-emerald-300 font-bold'
}

export default function IncidentSummaryView({ cls, onBack }: { cls: SchoolClass; onBack: () => void }) {
  const sessions = getSessionsForClass(cls.id)

  const stats: StudentIncidentStats[] = useMemo(() => {
    const students = Array.from({ length: cls.studentCount }, (_, i) => i + 1)
    return students.map((number) => {
      const byType = Object.fromEntries(INCIDENT_TYPES.map((t) => [t.id, 0])) as Record<IncidentTypeId, number>
      let participation = 0
      let cleanupHelp = 0
      for (const session of sessions) {
        const incidents = session.records[number] ?? {}
        for (const id of Object.keys(incidents) as IncidentTypeId[]) byType[id] += incidents[id] ?? 0
        participation += session.participation[number] ?? 0
        cleanupHelp += session.cleanupHelp[number] ?? 0
      }
      const total = Object.values(byType).reduce((a, b) => a + b, 0)
      return { number, name: cls.studentNames[number], byType, total, participation, cleanupHelp }
    })
  }, [cls, sessions])

  const incidentStats = stats.filter((s) => s.total > 0)
  const positiveStats = stats.filter((s) => s.participation > 0 || s.cleanupHelp > 0)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← {cls.name}
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Resumen de incidencias</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {sessions.length} sesión{sessions.length === 1 ? '' : 'es'} registrada{sessions.length === 1 ? '' : 's'} · ✓ = sin incidencias de ese tipo
        </p>
      </header>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Todavía no hay sesiones registradas para generar un resumen.
        </div>
      ) : (
        <>
          {incidentStats.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
              Ningún estudiante tiene incidencias registradas. 🎉
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                    <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                      Estudiante
                    </th>
                    {INCIDENT_TYPES.map((t) => (
                      <th
                        key={t.id}
                        title={t.description}
                        className="px-2 py-2 text-center font-medium text-slate-500 dark:text-slate-400"
                      >
                        <span className="block text-base">{t.icon}</span>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center font-semibold text-slate-600 dark:text-slate-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentStats.map((s) => (
                    <tr
                      key={s.number}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                        {s.number}
                        {s.name && <span className="ml-1 text-slate-500 dark:text-slate-400">· {s.name}</span>}
                      </td>
                      {INCIDENT_TYPES.map((t) => {
                        const count = s.byType[t.id]
                        return (
                          <td key={t.id} className={`px-2 py-2 text-center tabular-nums ${incidentCellClasses(count)}`}>
                            {count === 0 ? '✓' : `✗ ${count}`}
                          </td>
                        )
                      })}
                      <td className={`px-3 py-2 text-center font-bold tabular-nums ${incidentCellClasses(s.total)}`}>
                        {s.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Participación y ayuda con la limpieza
          </h2>
          {positiveStats.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
              Nadie tiene participación o ayuda con la limpieza registrada todavía.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                    <th className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">Estudiante</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-600 dark:text-slate-300">🙋 Participación</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-600 dark:text-slate-300">🧹 Limpieza</th>
                  </tr>
                </thead>
                <tbody>
                  {positiveStats.map((s) => (
                    <tr
                      key={s.number}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                        {s.number}
                        {s.name && <span className="ml-1 text-slate-500 dark:text-slate-400">· {s.name}</span>}
                      </td>
                      <td className={`px-3 py-2 text-center tabular-nums ${positiveCellClasses(s.participation)}`}>
                        {s.participation || '—'}
                      </td>
                      <td className={`px-3 py-2 text-center tabular-nums ${positiveCellClasses(s.cleanupHelp)}`}>
                        {s.cleanupHelp || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
