import type { ClassSession, IncidentTypeId, SchoolClass } from '../types'
import { RUBRIC_CRITERIA, criterionAchieved, incidentType } from '../types'

function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const label = date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function PrintableSession({
  cls,
  session,
  studentNames,
}: {
  cls: SchoolClass
  session: ClassSession
  studentNames: Record<number, string>
}) {
  const students = Array.from({ length: cls.studentCount }, (_, i) => i + 1)
  const studentsWithIncidents = students.filter((n) => Object.keys(session.records[n] ?? {}).length > 0)

  return (
    <div className="hidden print:block print:p-4 text-black">
      <h1 className="text-lg font-bold">Rúbrica de comportamiento y participación</h1>
      <p className="mb-1 text-sm">
        {cls.name} · {cls.grade} · {formatDateLong(session.date)}
      </p>
      <p className="mb-3 text-[10px]">
        ✓ = Criterio logrado &nbsp;&nbsp; <span className="text-red-600 font-bold">✗</span> = Criterio no logrado ese día &nbsp;&nbsp; 🙋 = Veces que participó activamente &nbsp;&nbsp; 🧹 = Veces que ayudó con la limpieza
      </p>

      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="border border-black px-1.5 py-1 text-left align-bottom">#</th>
            <th className="border border-black px-1.5 py-1 text-left align-bottom">Nombre</th>
            {RUBRIC_CRITERIA.map((c) => (
              <th key={c.id} className="border border-black px-1.5 py-1 text-center align-bottom font-medium">
                <span className="block font-bold">{c.title}</span>
                <span className="block font-normal italic">{c.description}</span>
              </th>
            ))}
            <th className="border border-black px-1.5 py-1 text-center align-bottom">🙋</th>
            <th className="border border-black px-1.5 py-1 text-center align-bottom">🧹</th>
          </tr>
        </thead>
        <tbody>
          {students.map((n) => {
            const incidents = session.records[n] ?? {}
            const participation = session.participation[n] ?? 0
            const cleanupHelp = session.cleanupHelp[n] ?? 0

            return (
              <tr key={n}>
                <td className="border border-black px-1.5 py-1">{n}</td>
                <td className="border border-black px-1.5 py-1">{studentNames[n] ?? ''}</td>
                {RUBRIC_CRITERIA.map((c) => {
                  const achieved = criterionAchieved(c, incidents)
                  return (
                    <td key={c.id} className="border border-black px-1.5 py-1 text-center font-bold">
                      {achieved ? '✓' : <span className="text-red-600">✗</span>}
                    </td>
                  )
                })}
                <td className="border border-black px-1.5 py-1 text-center">{participation || ''}</td>
                <td className="border border-black px-1.5 py-1 text-center">{cleanupHelp || ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-4">
        <h2 className="text-sm font-bold">Resumen de incidencias del día</h2>
        {studentsWithIncidents.length === 0 ? (
          <p className="text-[10px] italic">Ningún estudiante tuvo incidencias.</p>
        ) : (
          <ul className="mt-1 text-[10px] leading-snug">
            {studentsWithIncidents.map((n) => (
              <li key={n}>
                <span className="font-bold">
                  {n}
                  {studentNames[n] ? ` · ${studentNames[n]}` : ''}:
                </span>{' '}
                {(Object.keys(session.records[n] ?? {}) as IncidentTypeId[])
                  .map((id) => {
                    const type = incidentType(id)
                    const count = session.records[n]?.[id] ?? 0
                    return `${type.icon} ${type.label}${count > 1 ? ` ×${count}` : ''}`
                  })
                  .join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-xs">Firma del docente: ______________________________</p>
    </div>
  )
}
