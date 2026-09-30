export type IncidentTypeId =
  | 'no_trabajo'
  | 'dormido'
  | 'celular'
  | 'interrupcion'
  | 'hablo'
  | 'se_paro'
  | 'tarde'
  | 'salio'
  | 'basura'

export interface IncidentType {
  id: IncidentTypeId
  label: string
  icon: string
  description: string
}

export const INCIDENT_TYPES: IncidentType[] = [
  { id: 'tarde', label: 'Tarde', icon: '⏰', description: 'Llegó tarde' },
  { id: 'no_trabajo', label: 'No trabajó', icon: '✋', description: 'No realizó el trabajo' },
  { id: 'dormido', label: 'Dormido', icon: '😴', description: 'Se quedó dormido' },
  { id: 'celular', label: 'Celular', icon: '📱', description: 'Usó el celular' },
  { id: 'hablo', label: 'Habló', icon: '🗣️', description: 'Habló con el compañero' },
  { id: 'interrupcion', label: 'Interrumpió', icon: '📢', description: 'Interrumpió la clase' },
  { id: 'se_paro', label: 'Se paró', icon: '🚶', description: 'Se paró sin permiso' },
  { id: 'salio', label: 'Salió', icon: '🚪', description: 'Salió sin permiso' },
  { id: 'basura', label: 'Basura', icon: '🗑️', description: 'Tiró basura' },
]

export function incidentType(id: IncidentTypeId): IncidentType {
  const found = INCIDENT_TYPES.find((t) => t.id === id)
  if (!found) throw new Error(`Unknown incident type: ${id}`)
  return found
}

export interface SchoolClass {
  id: string
  name: string
  grade: string
  studentCount: number
  studentNames: Record<number, string>
  createdAt: string
}

export interface RubricCriterion {
  id: string
  title: string
  description: string
  incidentIds: IncidentTypeId[]
}

export const RUBRIC_CRITERIA: RubricCriterion[] = [
  {
    id: 'atencion',
    title: 'Atención y enfoque',
    description: 'Presta atención sin distraerse',
    incidentIds: ['dormido', 'celular'],
  },
  {
    id: 'permanencia',
    title: 'Permanencia y puntualidad',
    description: 'Llega a tiempo y permanece en su lugar',
    incidentIds: ['tarde', 'se_paro', 'salio'],
  },
  {
    id: 'responsabilidad',
    title: 'Responsabilidad académica',
    description: 'Realiza el trabajo asignado',
    incidentIds: ['no_trabajo'],
  },
  {
    id: 'respeto',
    title: 'Respeto y convivencia',
    description: 'Respeta el desarrollo de la clase',
    incidentIds: ['hablo', 'interrupcion'],
  },
  {
    id: 'orden',
    title: 'Orden del espacio',
    description: 'Mantiene su espacio limpio',
    incidentIds: ['basura'],
  },
]

export function criterionAchieved(criterion: RubricCriterion, incidents: IncidentTypeId[]): boolean {
  return !criterion.incidentIds.some((id) => incidents.includes(id))
}

export interface ClassSession {
  id: string
  classId: string
  date: string
  createdAt: string
  records: Record<number, IncidentTypeId[]>
  participation: Record<number, number>
}
