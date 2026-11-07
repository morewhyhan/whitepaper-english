-- Current SQLite design snapshot.
-- Source of truth: prisma/schema.prisma and prisma/migrations/.

CREATE TABLE "user" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "name" TEXT NOT NULL,
  "image" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "account" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" DATETIME,
  "refreshTokenExpiresAt" DATETIME,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE ("providerId", "accountId")
);

CREATE TABLE "verification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  UNIQUE ("identifier", "value")
);

CREATE TABLE "task" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "userId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "word_state" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "word" TEXT NOT NULL,
  "known" BOOLEAN NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "session_userId_idx" ON "session" ("userId");
CREATE INDEX "account_userId_idx" ON "account" ("userId");
CREATE INDEX "task_userId_createdAt_idx" ON "task" ("userId", "createdAt");
CREATE UNIQUE INDEX "word_state_userId_word_key" ON "word_state" ("userId", "word");
CREATE INDEX "word_state_userId_idx" ON "word_state" ("userId");
