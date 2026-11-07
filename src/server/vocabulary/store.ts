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
