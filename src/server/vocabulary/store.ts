import type { PrismaClient } from '@prisma/client'

export type WordState = {
  word: string
  known: boolean
}

const DEFAULT_BOOK = 'parallel-world'
const DEFAULT_DATE = '1970-01-01'

export async function listWordStates(
  prisma: PrismaClient,
  userId: string,
  bookId = DEFAULT_BOOK,
  localDate = DEFAULT_DATE,
): Promise<WordState[]> {
  return prisma.word_state.findMany({
    where: { userId, bookId, localDate },
    orderBy: { word: 'asc' },
    select: { word: true, known: true },
  })
}

export async function clearWordStates(
  prisma: PrismaClient,
  userId: string,
  words: string[],
  bookId = DEFAULT_BOOK,
  localDate = DEFAULT_DATE,
): Promise<void> {
  await prisma.word_state.deleteMany({
    where: { userId, bookId, localDate, word: { in: words } },
  })
}

export async function setWordStates(
  prisma: PrismaClient,
  userId: string,
  bookId: string,
  localDate: string,
  judgements: WordState[],
): Promise<void> {
  await prisma.$transaction(
    judgements.map(({ word, known }) =>
      prisma.word_state.upsert({
        where: { userId_bookId_localDate_word: { userId, bookId, localDate, word } },
        create: { userId, bookId, localDate, word, known },
        update: { known },
      }),
    ),
  )
}

export async function setWordState(
  prisma: PrismaClient,
  userId: string,
  word: string,
  known: boolean,
  bookId = DEFAULT_BOOK,
  localDate = DEFAULT_DATE,
): Promise<void> {
  await prisma.word_state.upsert({
    where: { userId_bookId_localDate_word: { userId, bookId, localDate, word } },
    create: { userId, bookId, localDate, word, known },
    update: { known },
  })
}

export type DailySession = {
  round: number
  cursor: number
  ids: string[]
  missed: string[]
  history: { round: number; total: number; missed: number }[]
  complete: boolean
}

function parseArray<T>(value: string): T[] {
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export async function getDailySession(
  prisma: PrismaClient,
  userId: string,
  bookId: string,
  localDate: string,
): Promise<DailySession | null> {
  const row = await prisma.daily_session.findUnique({
    where: { userId_bookId_localDate: { userId, bookId, localDate } },
  })
  if (!row) return null

  return {
    round: row.round,
    cursor: row.cursor,
    ids: parseArray<string>(row.ids),
    missed: parseArray<string>(row.missed),
    history: parseArray<{ round: number; total: number; missed: number }>(row.history),
    complete: row.complete,
  }
}

export async function saveDailySession(
  prisma: PrismaClient,
  userId: string,
  bookId: string,
  localDate: string,
  session: DailySession,
): Promise<DailySession> {
  const data = {
    round: session.round,
    cursor: session.cursor,
    ids: JSON.stringify(session.ids),
    missed: JSON.stringify(session.missed),
    history: JSON.stringify(session.history),
    complete: session.complete,
  }

  const row = await prisma.daily_session.upsert({
    where: { userId_bookId_localDate: { userId, bookId, localDate } },
    create: { userId, bookId, localDate, ...data },
    update: data,
  })

  return {
    round: row.round,
    cursor: row.cursor,
    ids: parseArray<string>(row.ids),
    missed: parseArray<string>(row.missed),
    history: parseArray<{ round: number; total: number; missed: number }>(row.history),
    complete: row.complete,
  }
}
