CREATE TABLE "daily_session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "localDate" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "cursor" INTEGER NOT NULL DEFAULT 0,
    "ids" TEXT NOT NULL,
    "missed" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "daily_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "daily_session_userId_bookId_localDate_key" ON "daily_session"("userId", "bookId", "localDate");
CREATE INDEX "daily_session_userId_localDate_idx" ON "daily_session"("userId", "localDate");
