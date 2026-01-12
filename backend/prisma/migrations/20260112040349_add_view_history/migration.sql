/*
  Warnings:

  - You are about to drop the column `attempts` on the `ScrapeJob` table. All the data in the column will be lost.
  - You are about to drop the column `errorLog` on the `ScrapeJob` table. All the data in the column will be lost.
  - You are about to drop the column `finishedAt` on the `ScrapeJob` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `ScrapeJob` table. All the data in the column will be lost.
  - You are about to drop the `ViewHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `jobType` to the `ScrapeJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ScrapeJob` table without a default value. This is not possible if the table is not empty.
  - Made the column `startedAt` on table `ScrapeJob` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "ScrapeJob_targetUrl_targetType_key";

-- AlterTable
ALTER TABLE "ScrapeJob" DROP COLUMN "attempts",
DROP COLUMN "errorLog",
DROP COLUMN "finishedAt",
DROP COLUMN "targetType",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "errorMsg" TEXT,
ADD COLUMN     "itemsScraped" INTEGER,
ADD COLUMN     "jobType" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "startedAt" SET NOT NULL,
ALTER COLUMN "startedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "ViewHistory";

-- CreateTable
CREATE TABLE "view_history" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "product_id" TEXT,
    "category_id" TEXT,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "view_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "view_history_session_id_idx" ON "view_history"("session_id");

-- CreateIndex
CREATE INDEX "view_history_viewed_at_idx" ON "view_history"("viewed_at");

-- CreateIndex
CREATE INDEX "view_history_session_id_viewed_at_idx" ON "view_history"("session_id", "viewed_at" DESC);

-- CreateIndex
CREATE INDEX "ScrapeJob_status_idx" ON "ScrapeJob"("status");

-- CreateIndex
CREATE INDEX "ScrapeJob_startedAt_idx" ON "ScrapeJob"("startedAt");

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_history" ADD CONSTRAINT "view_history_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
