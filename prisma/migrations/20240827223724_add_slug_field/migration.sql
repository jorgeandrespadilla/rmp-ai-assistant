/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `professors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `professors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `subjects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "professors" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "professors_slug_key" ON "professors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "schools_slug_key" ON "schools"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_slug_key" ON "subjects"("slug");
