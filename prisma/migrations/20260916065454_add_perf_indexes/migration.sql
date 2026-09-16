-- CreateIndex
CREATE INDEX "Berita_isPublished_publishedAt_idx" ON "Berita"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX "Siswa_orang_tua_email_idx" ON "Siswa"("orang_tua_email");
