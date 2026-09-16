/*
  Warnings:

  - Added the required column `jurusan_diminati` to the `Registrasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tahun_lulus` to the `Registrasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenExpiresAt` to the `Registrasi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Registrasi" ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "jurusan_diminati" TEXT NOT NULL,
ADD COLUMN     "tahun_lulus" INTEGER NOT NULL,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3) NOT NULL;
