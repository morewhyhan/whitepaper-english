ALTER TABLE "word_state" ADD COLUMN "bookId" TEXT NOT NULL DEFAULT 'parallel-world';
ALTER TABLE "word_state" ADD COLUMN "localDate" TEXT NOT NULL DEFAULT '1970-01-01';

DROP INDEX "word_state_userId_word_key";

CREATE UNIQUE INDEX "word_state_userId_bookId_localDate_word_key" ON "word_state"("userId", "bookId", "localDate", "word");
CREATE INDEX "word_state_userId_bookId_localDate_idx" ON "word_state"("userId", "bookId", "localDate");
