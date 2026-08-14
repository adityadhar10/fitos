-- CreateTable
CREATE TABLE "DailyMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "sleepHours" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "DailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyMetric_userId_date_key" ON "DailyMetric"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyMetric" ADD CONSTRAINT "DailyMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
