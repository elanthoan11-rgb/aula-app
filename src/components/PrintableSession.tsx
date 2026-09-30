import type { ClassSession, SchoolClass } from '../types'
import { RUBRIC_CRITERIA, criterionAchieved } from '../types'

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

  return (
    <div className="hidden print:block print:p-4 text-black">
      <h1 className="text-lg font-bold">Rúbrica de comportamiento y participación</h1>
      <p className="mb-1 text-sm">
        {cls.name} · {cls.grade} · {formatDateLong(session.date)}
      </p>
      <p className="mb-3 text-[10px]">
        ✓ = Criterio logrado &nbsp;&nbsp; <span className="text-red-600 font-bold">✗</span> = Criterio no logrado ese día &nbsp;&nbsp; 🙋 = Veces que participó activamente
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
          </tr>
        </thead>
        <tbody>
          {students.map((n) => {
            const incidents = session.records[n] ?? []
            const participation = session.participation[n] ?? 0

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
              </tr>
            )
          })}
        </tbody>
      </table>

      <p className="mt-6 text-xs">Firma del docente: ______________________________</p>
    </div>
  )
}
