import { getSupabase } from './supabase'
import type { AuthUser, Profile, SessionSummary } from './types-extra'
import type { SessionSnapshot } from '../data/types'

export async function upsertProfile(user: AuthUser, profile: Profile): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    await sb.from('profiles').upsert(
      { id: user.id, nickname: profile.nickname, school: profile.school, avatar: profile.avatar },
      { onConflict: 'id' },
    )
  } catch {
    // offline / belum dikonfigurasi: abaikan
  }
}

export async function syncSession(
  user: AuthUser | null,
  sessionId: string,
  snapshot: SessionSnapshot,
): Promise<void> {
  const sb = getSupabase()
  if (!sb || !user) return
  try {
    await sb.from('game_sessions').upsert(
      {
        id: sessionId,
        user_id: user.id,
        character_id: snapshot.characterId,
        position: snapshot.position,
        day: snapshot.day,
        money: snapshot.money,
        savings: snapshot.savings,
        aspect_scores: snapshot.aspectScores,
        status: snapshot.status,
        started_at: new Date(snapshot.startedAt).toISOString(),
      },
      { onConflict: 'id' },
    )
  } catch {
    // abaikan
  }
}

export async function insertDecision(
  user: AuthUser | null,
  sessionId: string,
  d: { day: number; cardId: string; choiceId: string },
): Promise<void> {
  const sb = getSupabase()
  if (!sb || !user) return
  try {
    await sb.from('session_decisions').insert({
      session_id: sessionId,
      card_id: d.cardId,
      choice_id: d.choiceId,
      day: d.day,
    })
  } catch {
    // abaikan
  }
}

export async function insertReflection(
  user: AuthUser | null,
  sessionId: string,
  answers: Record<string, string>,
): Promise<void> {
  const sb = getSupabase()
  if (!sb || !user) return
  try {
    await sb.from('reflections').insert({ session_id: sessionId, answers })
  } catch {
    // abaikan
  }
}

export async function upsertHistory(
  user: AuthUser | null,
  summary: SessionSummary,
): Promise<void> {
  const sb = getSupabase()
  if (!sb || !user) return
  try {
    await sb.from('game_sessions').update({ status: summary.status }).eq('id', summary.id)
  } catch {
    // abaikan
  }
}
