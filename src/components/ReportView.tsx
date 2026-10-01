import { useMemo } from 'react'
import type { IncidentTypeId, SchoolClass } from '../types'
import { INCIDENT_TYPES } from '../types'
import { getSessionsForClass } from '../lib/storage'

interface StudentStats {
  number: number
  name?: string
  total: number
  byType: Record<IncidentTypeId, number>
  participation: number
  cleanupHelp: number
}

export default function ReportView({ cls, onBack }: { cls: SchoolClass; onBack: () => void }) {
  const sessions = getSessionsForClass(cls.id)

  const stats: StudentStats[] = useMemo(() => {
    const students = Array.from({ length: cls.studentCount }, (_, i) => i + 1)
    return students
      .map((number) => {
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
        return { number, name: cls.studentNames[number], total, byType, participation, cleanupHelp }
      })
      .sort((a, b) => b.total - a.total || a.number - b.number)
  }, [cls, sessions])

  const totalIncidents = stats.reduce((sum, s) => sum + s.total, 0)

  function handleExportCSV() {
    const header = ['Número', 'Nombre', ...INCIDENT_TYPES.map((t) => t.label), 'Total', 'Participación activa', 'Ayuda con la limpieza']
    const rows = stats.map((s) => [
      String(s.number),
      s.name ?? '',
      ...INCIDENT_TYPES.map((t) => String(s.byType[t.id])),
      String(s.total),
      String(s.participation),
      String(s.cleanupHelp),
    ])
    const csv = [header, ...rows].map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${cls.name.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reporte</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {sessions.length} sesión{sessions.length === 1 ? '' : 'es'} registrada{sessions.length === 1 ? '' : 's'} ·{' '}
              {totalIncidents} incidencia{totalIncidents === 1 ? '' : 's'} en total
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            ⬇️ Exportar CSV
          </button>
        </div>
      </header>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Todavía no hay sesiones registradas para generar un reporte.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                  Estudiante
                </th>
                {INCIDENT_TYPES.map((t) => (
                  <th key={t.id} title={t.description} className="px-2 py-2 text-center font-medium text-slate-500 dark:text-slate-400">
                    <span className="block text-base">{t.icon}</span>
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-semibold text-slate-600 dark:text-slate-300">Total</th>
                <th className="px-3 py-2 text-center font-semibold text-slate-600 dark:text-slate-300">🙋</th>
                <th className="px-3 py-2 text-center font-semibold text-slate-600 dark:text-slate-300">🧹</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr
                  key={s.number}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                    {s.number}
                    {s.name && <span className="ml-1 text-slate-500 dark:text-slate-400">· {s.name}</span>}
                  </td>
                  {INCIDENT_TYPES.map((t) => (
                    <td key={t.id} className="px-2 py-2 text-center tabular-nums text-slate-600 dark:text-slate-300">
                      {s.byType[t.id] || ''}
                    </td>
                  ))}
                  <td
                    className={`px-3 py-2 text-center font-bold tabular-nums ${
                      s.total > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {s.total}
                  </td>
                  <td className="px-3 py-2 text-center font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {s.participation || ''}
                  </td>
                  <td className="px-3 py-2 text-center font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                    {s.cleanupHelp || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
