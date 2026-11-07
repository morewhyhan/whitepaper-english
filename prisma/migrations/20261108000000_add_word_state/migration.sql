CREATE TABLE "word_state" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "known" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "word_state_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "word_state_userId_word_key" ON "word_state"("userId", "word");
CREATE INDEX "word_state_userId_idx" ON "word_state"("userId");
