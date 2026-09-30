import { useState } from 'react'
import type { SchoolClass } from './types'
import { getClasses, getClass, getSession, getOrCreateTodaySession } from './lib/storage'
import Home from './components/Home'
import ClassView from './components/ClassView'
import SessionView from './components/SessionView'
import ReportView from './components/ReportView'

type View =
  | { screen: 'home' }
  | { screen: 'class'; classId: string }
  | { screen: 'session'; classId: string; sessionId: string }
  | { screen: 'report'; classId: string }

export default function App() {
  const [classes, setClasses] = useState<SchoolClass[]>(() => getClasses())
  const [view, setView] = useState<View>({ screen: 'home' })

  function refreshClasses() {
    setClasses(getClasses())
  }

  if (view.screen === 'home') {
    return (
      <Home
        classes={classes}
        onOpenClass={(classId) => setView({ screen: 'class', classId })}
        onOpenToday={(classId) => {
          const session = getOrCreateTodaySession(classId)
          setView({ screen: 'session', classId, sessionId: session.id })
        }}
        onClassesChanged={refreshClasses}
      />
    )
  }

  const cls = getClass(view.classId)
  if (!cls) {
    setView({ screen: 'home' })
    return null
  }

  if (view.screen === 'class') {
    return (
      <ClassView
        cls={cls}
        onBack={() => {
          refreshClasses()
          setView({ screen: 'home' })
        }}
        onOpenSession={(sessionId) => setView({ screen: 'session', classId: cls.id, sessionId })}
        onOpenReport={() => setView({ screen: 'report', classId: cls.id })}
        onClassChanged={refreshClasses}
      />
    )
  }

  if (view.screen === 'report') {
    return <ReportView cls={cls} onBack={() => setView({ screen: 'class', classId: cls.id })} />
  }

  const session = getSession(view.sessionId)
  if (!session) {
    setView({ screen: 'class', classId: cls.id })
    return null
  }

  return (
    <SessionView
      cls={cls}
      session={session}
      onBack={() => setView({ screen: 'class', classId: cls.id })}
      onSessionChanged={refreshClasses}
    />
  )
}
