/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `Spot` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Spot` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Spot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "place" TEXT NOT NULL,
    "bloom" INTEGER NOT NULL,
    "weather" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Spot" ("bloom", "comment", "createdAt", "id", "place", "weather") SELECT "bloom", "comment", "createdAt", "id", "place", "weather" FROM "Spot";
DROP TABLE "Spot";
ALTER TABLE "new_Spot" RENAME TO "Spot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
