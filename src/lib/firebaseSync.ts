import { doc, setDoc, collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import type { SessionSnapshot, DecisionRecord } from '../data/types'

export async function saveSessionToFirebase(
  userId: string,
  sessionId: string,
  snapshot: SessionSnapshot,
): Promise<void> {
  if (!db || !userId) return
  try {
    const sessionRef = doc(db, 'users', userId, 'sessions', sessionId)
    await setDoc(
      sessionRef,
      {
        ...snapshot,
        updatedAt: Date.now(),
      },
      { merge: true },
    )
  } catch (err) {
    console.warn('Gagal menyimpan sesi ke Firebase:', err)
  }
}

export async function loadLatestSessionFromFirebase(
  userId: string,
): Promise<SessionSnapshot | null> {
  if (!db || !userId) return null
  try {
    const sessionsCol = collection(db, 'users', userId, 'sessions')
    const querySnapshot = await getDocs(sessionsCol)
    if (querySnapshot.empty) return null

    let latest: SessionSnapshot | null = null
    let maxTime = 0

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as SessionSnapshot & { updatedAt?: number }
      const time = data.updatedAt || data.startedAt || 0
      if (time > maxTime && data.status === 'active') {
        maxTime = time
        latest = data
      }
    })

    return latest
  } catch (err) {
    console.warn('Gagal memuat sesi dari Firebase:', err)
    return null
  }
}

export async function saveDecisionToFirebase(
  userId: string,
  sessionId: string,
  decision: DecisionRecord,
): Promise<void> {
  if (!db || !userId) return
  try {
    const decisionRef = doc(
      db,
      'users',
      userId,
      'sessions',
      sessionId,
      'decisions',
      `day-${decision.day}-${decision.cardId}`,
    )
    await setDoc(decisionRef, {
      ...decision,
      createdAt: Date.now(),
    })
  } catch (err) {
    console.warn('Gagal menyimpan keputusan ke Firebase:', err)
  }
}
