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
  | 'otra_asignatura'
  | 'juego_brusco'
  | 'lenguaje_inapropiado'
  | 'maquillaje'

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
  { id: 'otra_asignatura', label: 'Otra tarea', icon: '📚', description: 'Trabajó en otra asignatura durante la clase' },
  { id: 'juego_brusco', label: 'Juego brusco', icon: '🤜', description: 'Jugó con golpes con otro estudiante' },
  { id: 'lenguaje_inapropiado', label: 'Lenguaje inapropiado', icon: '🤬', description: 'Dijo palabras inapropiadas u obscenas' },
  { id: 'maquillaje', label: 'Maquillaje', icon: '💄', description: 'Se estaba maquillando en clase' },
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
    incidentIds: ['no_trabajo', 'otra_asignatura', 'maquillaje'],
  },
  {
    id: 'respeto',
    title: 'Respeto y convivencia',
    description: 'Respeta el desarrollo de la clase',
    incidentIds: ['hablo', 'interrupcion', 'juego_brusco', 'lenguaje_inapropiado'],
  },
  {
    id: 'orden',
    title: 'Orden del espacio',
    description: 'Mantiene su espacio limpio',
    incidentIds: ['basura'],
  },
]

export type IncidentCounts = Partial<Record<IncidentTypeId, number>>

export const MAX_INCIDENT_LEVEL = 3

export function criterionAchieved(criterion: RubricCriterion, incidents: IncidentCounts): boolean {
  return !criterion.incidentIds.some((id) => (incidents[id] ?? 0) > 0)
}

export interface ClassSession {
  id: string
  classId: string
  date: string
  createdAt: string
  records: Record<number, IncidentCounts>
  participation: Record<number, number>
  cleanupHelp: Record<number, number>
}
