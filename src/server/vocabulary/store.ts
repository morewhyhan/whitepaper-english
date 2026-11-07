import type { PrismaClient } from '@prisma/client'

export type WordState = {
  word: string
  known: boolean
}

export async function listWordStates(prisma: PrismaClient, userId: string): Promise<WordState[]> {
  return prisma.word_state.findMany({
    where: { userId },
    orderBy: { word: 'asc' },
    select: { word: true, known: true },
  })
}

export async function clearWordStates(
  prisma: PrismaClient,
  userId: string,
  words: string[],
): Promise<void> {
  await prisma.word_state.deleteMany({
    where: { userId, word: { in: words } },
  })
}

export async function setWordStates(
  prisma: PrismaClient,
  userId: string,
  judgements: WordState[],
): Promise<void> {
  await prisma.$transaction(
    judgements.map(({ word, known }) =>
      prisma.word_state.upsert({
        where: { userId_word: { userId, word } },
        create: { userId, word, known },
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
): Promise<void> {
  await prisma.word_state.upsert({
    where: { userId_word: { userId, word } },
    create: { userId, word, known },
    update: { known },
  })
}
