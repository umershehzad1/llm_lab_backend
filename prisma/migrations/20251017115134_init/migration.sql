-- CreateTable
CREATE TABLE "Experiment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prompt" TEXT NOT NULL,
    "temperature" REAL NOT NULL,
    "topP" REAL NOT NULL,
    "response" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
