import { randomUUID } from "crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "Test123!";
const TAHUN_AJARAN = "2024/2025";

async function hashed() {
  return bcrypt.hash(PASSWORD, 12);
}

async function upsertUser(email: string, role: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: await hashed(), role },
  });
}

async function main() {
  // --- Admin ---
  await upsertUser("admin@smu.co.id", "admin");

  // --- Kelas ---
  const kelasData = [
    { nama: "10 IPA 1", tingkat: 10, jurusan: "IPA" },
    { nama: "11 IPS 1", tingkat: 11, jurusan: "IPS" },
    { nama: "12 Bahasa 1", tingkat: 12, jurusan: "Bahasa" },
  ];

  const kelasList = [];
  for (const k of kelasData) {
    const kelas = await prisma.kelas.upsert({
      where: {
        nama_tahun_ajaran_semester: {
          nama: k.nama,
          tahun_ajaran: TAHUN_AJARAN,
          semester: 1,
        },
      },
      update: {},
      create: {
        nama: k.nama,
        tingkat: k.tingkat,
        jurusan: k.jurusan,
        tahun_ajaran: TAHUN_AJARAN,
        semester: 1,
      },
    });
    kelasList.push(kelas);
  }

  // --- Guru ---
  const guruData = [
    { email: "guru1@smu.co.id", nama: "Budi Santoso", nip: "198001012010011001", mapel: ["Matematika"] },
    { email: "guru2@smu.co.id", nama: "Siti Aminah", nip: "198203152011012002", mapel: ["Bahasa Indonesia"] },
    { email: "guru3@smu.co.id", nama: "Ahmad Fauzi", nip: "197911202009011003", mapel: ["Bahasa Inggris"] },
  ];

  const guruList = [];
  for (let i = 0; i < guruData.length; i++) {
    const g = guruData[i];
    const user = await upsertUser(g.email, "guru");
    const guru = await prisma.guru.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        nama: g.nama,
        nip: g.nip,
        mata_pelajaran: g.mapel,
        alamat: "Jl. Pendidikan No. " + (i + 1),
        no_telepon: "08123456780" + i,
      },
    });
    guruList.push(guru);
  }

  // Assign guru wali kelas
  for (let i = 0; i < kelasList.length; i++) {
    await prisma.kelas.update({
      where: { id: kelasList[i].id },
      data: { guru_waliId: guruList[i % guruList.length].id },
    });
  }

  // --- Siswa (10) ---
  const siswaList = [];
  for (let i = 1; i <= 10; i++) {
    const email = `siswa${i}@smu.co.id`;
    const user = await upsertUser(email, "siswa");
    const kelas = kelasList[i % kelasList.length];
    const siswa = await prisma.siswa.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        nama: `Siswa ${i}`,
        nisn: `00${String(i).padStart(6, "0")}`,
        nik: `320101010${String(i).padStart(6, "0")}`,
        tempat_lahir: "Jakarta",
        tanggal_lahir: new Date(2008, 0, i),
        jenis_kelamin: i % 2 === 0 ? "P" : "L",
        alamat: `Jl. Siswa No. ${i}`,
        no_telepon: `08987654${String(i).padStart(3, "0")}`,
        orang_tua_nama: `Orang Tua ${((i - 1) % 3) + 1}`,
        orang_tua_email: `orangtua${((i - 1) % 3) + 1}@smu.co.id`,
        orang_tua_telepon: `08199988${String(i).padStart(3, "0")}`,
        kelasId: kelas.id,
      },
    });
    siswaList.push(siswa);
  }

  // --- Orang Tua (3) ---
  for (let i = 1; i <= 3; i++) {
    await upsertUser(`orangtua${i}@smu.co.id`, "orang_tua");
  }

  // --- Jadwal (12 entries: 3 per hari across Senin-Kamis) ---
  const hariList = ["Senin", "Selasa", "Rabu", "Kamis"];
  const jamSlots = [
    { mulai: "07:00", selesai: "08:30" },
    { mulai: "08:30", selesai: "10:00" },
    { mulai: "10:15", selesai: "11:45" },
  ];
  const mapelPerGuru = guruList.map((g) => g.mata_pelajaran[0]);

  let jadwalIndex = 0;
  for (const hari of hariList) {
    for (const slot of jamSlots) {
      const kelas = kelasList[jadwalIndex % kelasList.length];
      const guru = guruList[jadwalIndex % guruList.length];
      const mapel = mapelPerGuru[jadwalIndex % mapelPerGuru.length];

      await prisma.jadwal.upsert({
        where: { id: `seed-jadwal-${hari}-${slot.mulai}-${kelas.id}` },
        update: {},
        create: {
          id: `seed-jadwal-${hari}-${slot.mulai}-${kelas.id}`,
          hari,
          jam_mulai: slot.mulai,
          jam_selesai: slot.selesai,
          mapel,
          ruangan: `Ruang ${(jadwalIndex % 5) + 1}`,
          kelasId: kelas.id,
          guruId: guru.id,
        },
      });
      jadwalIndex++;
    }
  }

  // --- Nilai (10 siswa x 3 mapel x 2 semester, so the trend chart has more than one point) ---
  const mapelList = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris"];
  for (const siswa of siswaList) {
    for (let m = 0; m < mapelList.length; m++) {
      const guru = guruList[m % guruList.length];
      for (const semester of [1, 2]) {
        const trendBump = semester === 2 ? 3 : 0; // slight improvement in semester 2
        await prisma.nilai.upsert({
          where: {
            siswaId_mapel_semester: {
              siswaId: siswa.id,
              mapel: mapelList[m],
              semester,
            },
          },
          update: {},
          create: {
            siswaId: siswa.id,
            mapel: mapelList[m],
            semester,
            nilai_harian: 75 + ((m * 3) % 20) + trendBump,
            nilai_uts: 78 + ((m * 5) % 15) + trendBump,
            nilai_uas: 80 + ((m * 2) % 15) + trendBump,
            nilai_akhir: 80 + trendBump,
            guruId: guru.id,
          },
        });
      }
    }
  }

  // --- Berita (5) ---
  const beritaData = [
    { judul: "Penerimaan Siswa Baru Tahun Ajaran 2024/2025", slug: "psb-2024-2025" },
    { judul: "Tim Sains SMU Raih Juara 1 Olimpiade Nasional", slug: "juara-olimpiade-nasional" },
    { judul: "Kegiatan Class Meeting Semester Ganjil", slug: "class-meeting-semester-ganjil" },
    { judul: "Workshop Literasi Digital untuk Guru", slug: "workshop-literasi-digital" },
    { judul: "Libur Semester dan Jadwal Ujian Akhir", slug: "libur-semester-ujian-akhir" },
  ];

  for (const b of beritaData) {
    await prisma.berita.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        judul: b.judul,
        slug: b.slug,
        konten: `<p>${b.judul}. Konten lengkap akan segera diperbarui oleh admin.</p>`,
        gambar: "/images/placeholder-berita.jpg",
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  // --- Galeri (5) ---
  const galeriData = [
    "Perayaan Hari Kemerdekaan",
    "Pentas Seni Akhir Tahun",
    "Lomba Cerdas Cermat Antar Kelas",
    "Kunjungan Edukasi ke Museum",
    "Wisuda Angkatan 2024",
  ];

  for (let i = 0; i < galeriData.length; i++) {
    const judul = galeriData[i];
    const existing = await prisma.galeri.findFirst({ where: { judul } });
    if (!existing) {
      await prisma.galeri.create({
        data: {
          judul,
          deskripsi: `Dokumentasi kegiatan: ${judul}`,
          gambar: `/images/placeholder-galeri-${(i % 3) + 1}.jpg`,
          tipe: "foto",
        },
      });
    }
  }

  // --- Galeri video (1, so the foto/video filter has something to demo) ---
  const videoExisting = await prisma.galeri.findFirst({ where: { judul: "Profil Sekolah SMU" } });
  if (!videoExisting) {
    await prisma.galeri.create({
      data: {
        judul: "Profil Sekolah SMU",
        deskripsi: "Video profil singkat mengenai lingkungan dan kegiatan SMU.",
        gambar: "/images/placeholder-galeri-1.jpg",
        tipe: "video",
        link_video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    });
  }

  // --- Registrasi (demo entries covering all statuses, so /admin/registrasi has something to review) ---
  const registrasiData = [
    {
      nama: "Rahmat Hidayat",
      email: "rahmat.hidayat.calon@example.com",
      status: "pending",
      isVerified: true,
      jurusan: "IPA",
    },
    {
      nama: "Dewi Lestari",
      email: "dewi.lestari.calon@example.com",
      status: "pending",
      isVerified: false,
      jurusan: "IPS",
    },
    {
      nama: "Fajar Nugroho",
      email: "fajar.nugroho.calon@example.com",
      status: "approved",
      isVerified: true,
      jurusan: "IPA",
    },
    {
      nama: "Putri Ramadhani",
      email: "putri.ramadhani.calon@example.com",
      status: "rejected",
      isVerified: true,
      jurusan: "Bahasa",
    },
  ];

  for (const r of registrasiData) {
    const existing = await prisma.registrasi.findFirst({ where: { email: r.email } });
    if (existing) continue;
    await prisma.registrasi.create({
      data: {
        nama: r.nama,
        email: r.email,
        no_telepon: "0812" + String(Math.floor(10000000 + Math.random() * 89999999)),
        alamat: `Jl. Calon Siswa No. ${Math.floor(Math.random() * 50) + 1}`,
        asal_sekolah: "SMP Negeri Contoh",
        nilai_rata_rata: 80 + Math.floor(Math.random() * 15),
        tahun_lulus: 2026,
        jurusan_diminati: r.jurusan,
        catatan: "Data pendaftaran contoh (dummy) untuk keperluan demo.",
        status: r.status,
        isVerified: r.isVerified,
        token_verifikasi: randomUUID(),
        tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("Seed selesai.");
  console.log("Login credentials (password: " + PASSWORD + "):");
  console.log("  Admin     : admin@smu.co.id");
  console.log("  Guru      : guru1@smu.co.id");
  console.log("  Siswa     : siswa1@smu.co.id");
  console.log("  Orang Tua : orangtua1@smu.co.id");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
