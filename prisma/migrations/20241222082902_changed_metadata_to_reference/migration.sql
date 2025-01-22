/*
  Warnings:

  - You are about to drop the column `metaData` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `reference` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "metaData",
ADD COLUMN     "reference" TEXT NOT NULL;
