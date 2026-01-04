-- CreateTable
CREATE TABLE "Spot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "place" TEXT NOT NULL,
    "bloom" INTEGER NOT NULL,
    "weather" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
