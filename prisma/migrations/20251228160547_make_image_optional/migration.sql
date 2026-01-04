-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "place" TEXT NOT NULL,
    "bloom" INTEGER NOT NULL,
    "weather" TEXT NOT NULL,
    "imageUrl" TEXT,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Spot" ("bloom", "comment", "createdAt", "id", "imageUrl", "place", "weather") SELECT "bloom", "comment", "createdAt", "id", "imageUrl", "place", "weather" FROM "Spot";
DROP TABLE "Spot";
ALTER TABLE "new_Spot" RENAME TO "Spot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
