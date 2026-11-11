import 'server-only'

import { prisma } from '@/server/database/client'

type DeskPayload = {
  state?: Record<string, unknown>
  undoStack?: unknown[]
  redoStack?: unknown[]
}

function parsePayload(raw: string): DeskPayload {
  try {
    const parsed = JSON.parse(raw) as DeskPayload
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function mergePayload(keep: DeskPayload, incoming: DeskPayload): DeskPayload {
  const keepState = keep.state ?? {}
  const incomingState = incoming.state ?? {}
  const cycles = new Map<string, Record<string, unknown>>()
  for (const cycle of [
    ...((keepState.cycles as Record<string, unknown>[]) ?? []),
    ...((incomingState.cycles as Record<string, unknown>[]) ?? []),
  ]) {
    if (!cycle || typeof cycle !== 'object' || typeof cycle.id !== 'string') continue
    const prior = cycles.get(cycle.id)
    if (!prior || String(cycle.updatedAt ?? '') > String(prior.updatedAt ?? '')) {
      cycles.set(cycle.id, cycle)
    }
  }

  return {
    state: {
      ...keepState,
      ...incomingState,
      cycles: [...cycles.values()],
      sessions: {
        ...((keepState.sessions as Record<string, unknown>) ?? {}),
        ...((incomingState.sessions as Record<string, unknown>) ?? {}),
      },
      trashedIds: [
        ...new Set([
          ...((keepState.trashedIds as string[]) ?? []),
          ...((incomingState.trashedIds as string[]) ?? []),
        ]),
      ],
      customAssociations: {
        ...((keepState.customAssociations as Record<string, unknown>) ?? {}),
        ...((incomingState.customAssociations as Record<string, unknown>) ?? {}),
      },
    },
    undoStack: [
      ...((keep.undoStack as unknown[]) ?? []),
      ...((incoming.undoStack as unknown[]) ?? []),
    ].slice(-120),
    redoStack: [
      ...((keep.redoStack as unknown[]) ?? []),
      ...((incoming.redoStack as unknown[]) ?? []),
    ].slice(-120),
  }
}

export async function mergeAnonymousDesks(anonymousUserId: string, newUserId: string) {
  const rows = await prisma.vocabulary_desk.findMany({ where: { userId: anonymousUserId } })
  for (const row of rows) {
    const existing = await prisma.vocabulary_desk.findUnique({
      where: { userId_bookId: { userId: newUserId, bookId: row.bookId } },
    })
    if (existing) {
      const merged = mergePayload(parsePayload(existing.payload), parsePayload(row.payload))
      await prisma.vocabulary_desk.update({
        where: { id: existing.id },
        data: { payload: JSON.stringify(merged) },
      })
      await prisma.vocabulary_desk.delete({ where: { id: row.id } })
    } else {
      await prisma.vocabulary_desk.update({
        where: { id: row.id },
        data: { userId: newUserId },
      })
    }
  }
}
