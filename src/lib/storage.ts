import type { ClassSession, IncidentTypeId, SchoolClass } from '../types'

const CLASSES_KEY = 'aula.classes'
const SESSIONS_KEY = 'aula.sessions'

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function newId(): string {
  return crypto.randomUUID()
}

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getClasses(): SchoolClass[] {
  return readJSON<SchoolClass[]>(CLASSES_KEY, [])
}

function saveClasses(classes: SchoolClass[]): void {
  writeJSON(CLASSES_KEY, classes)
}

export function getClass(id: string): SchoolClass | undefined {
  return getClasses().find((c) => c.id === id)
}

export function createClass(input: {
  name: string
  grade: string
  studentCount: number
  studentNames?: Record<number, string>
}): SchoolClass {
  const cls: SchoolClass = {
    id: newId(),
    name: input.name.trim(),
    grade: input.grade.trim(),
    studentCount: input.studentCount,
    studentNames: input.studentNames ?? {},
    createdAt: new Date().toISOString(),
  }
  saveClasses([...getClasses(), cls])
  return cls
}

export function updateClass(
  id: string,
  patch: Partial<Pick<SchoolClass, 'name' | 'grade' | 'studentNames' | 'studentCount'>>,
): void {
  saveClasses(getClasses().map((c) => (c.id === id ? { ...c, ...patch } : c)))
}

export function setStudentName(classId: string, studentNumber: number, name: string): void {
  const cls = getClass(classId)
  if (!cls) return
  const studentNames = { ...cls.studentNames }
  if (name.trim()) {
    studentNames[studentNumber] = name.trim()
  } else {
    delete studentNames[studentNumber]
  }
  updateClass(classId, { studentNames })
}

export function deleteClass(id: string): void {
  saveClasses(getClasses().filter((c) => c.id !== id))
  saveSessions(getSessions().filter((s) => s.classId !== id))
}

function normalizeSession(session: ClassSession): ClassSession {
  return { ...session, participation: session.participation ?? {} }
}

function getSessions(): ClassSession[] {
  return readJSON<ClassSession[]>(SESSIONS_KEY, []).map(normalizeSession)
}

function saveSessions(sessions: ClassSession[]): void {
  writeJSON(SESSIONS_KEY, sessions)
}

export function getSessionsForClass(classId: string): ClassSession[] {
  return getSessions()
    .filter((s) => s.classId === classId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getSession(id: string): ClassSession | undefined {
  return getSessions().find((s) => s.id === id)
}

export function getOrCreateTodaySession(classId: string): ClassSession {
  const date = todayISO()
  const existing = getSessions().find((s) => s.classId === classId && s.date === date)
  if (existing) return existing

  const session: ClassSession = {
    id: newId(),
    classId,
    date,
    createdAt: new Date().toISOString(),
    records: {},
    participation: {},
  }
  saveSessions([...getSessions(), session])
  return session
}

export function deleteSession(id: string): void {
  saveSessions(getSessions().filter((s) => s.id !== id))
}

export function toggleIncident(sessionId: string, studentNumber: number, incidentId: IncidentTypeId): ClassSession | undefined {
  const sessions = getSessions()
  const idx = sessions.findIndex((s) => s.id === sessionId)
  if (idx === -1) return undefined

  const session = sessions[idx]
  const current = session.records[studentNumber] ?? []
  const has = current.includes(incidentId)
  const next = has ? current.filter((i) => i !== incidentId) : [...current, incidentId]

  const records = { ...session.records }
  if (next.length === 0) {
    delete records[studentNumber]
  } else {
    records[studentNumber] = next
  }

  const updated: ClassSession = { ...session, records }
  sessions[idx] = updated
  saveSessions(sessions)
  return updated
}

export function addParticipation(sessionId: string, studentNumber: number, delta: number): ClassSession | undefined {
  const sessions = getSessions()
  const idx = sessions.findIndex((s) => s.id === sessionId)
  if (idx === -1) return undefined

  const session = sessions[idx]
  const current = session.participation[studentNumber] ?? 0
  const next = Math.max(0, current + delta)

  const participation = { ...session.participation }
  if (next === 0) {
    delete participation[studentNumber]
  } else {
    participation[studentNumber] = next
  }

  const updated: ClassSession = { ...session, participation }
  sessions[idx] = updated
  saveSessions(sessions)
  return updated
}

export interface Backup {
  version: 1
  exportedAt: string
  classes: SchoolClass[]
  sessions: ClassSession[]
}

export function exportBackup(): Backup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    classes: getClasses(),
    sessions: getSessions(),
  }
}

export function importBackup(backup: Backup): void {
  saveClasses(backup.classes ?? [])
  saveSessions(backup.sessions ?? [])
}
