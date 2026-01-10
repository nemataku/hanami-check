-- CreateTable
CREATE TABLE "Spot" (
    "id" SERIAL NOT NULL,
    "place" TEXT NOT NULL,
    "bloom" INTEGER NOT NULL,
    "weather" TEXT,
    "imageUrl" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Spot_pkey" PRIMARY KEY ("id")
);
