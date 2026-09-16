const BRAND_COLOR = "#3B82F6";
const SCHOOL_NAME = "SMU";

// Every value interpolated into these templates can originate from user input (e.g. the
// public /registrasi form's `nama`, or admin-entered names that later flow into
// nilai-update emails sent to a parent's inbox) — escape it so it can never break out
// of the surrounding HTML.
function esc(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function baseLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:${BRAND_COLOR};padding:20px 24px;">
                <span style="color:#ffffff;font-size:18px;font-weight:bold;">${SCHOOL_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px;color:#1e293b;font-size:14px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background-color:#f1f5f9;color:#64748b;font-size:12px;">
                Email ini dikirim otomatis oleh sistem informasi ${SCHOOL_NAME}. Jangan balas email ini.
                Untuk bantuan, hubungi admin@smu.join.co.id.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="border-radius:8px;background-color:${BRAND_COLOR};">
        <a href="${href}" style="display:inline-block;padding:10px 20px;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export function registrationConfirmationTemplate(params: {
  nama: string;
  verifyUrl: string;
}): { subject: string; html: string } {
  const body = `
    <p>Halo <strong>${esc(params.nama)}</strong>,</p>
    <p>Terima kasih telah mendaftar sebagai calon siswa baru di ${SCHOOL_NAME}. Silakan verifikasi alamat email Anda untuk melanjutkan proses pendaftaran.</p>
    ${ctaButton(params.verifyUrl, "Verifikasi Email")}
    <p style="color:#64748b;font-size:12px;">Link ini berlaku selama 24 jam. Setelah email terverifikasi, tim admin kami akan meninjau pendaftaran Anda.</p>
  `;
  return {
    subject: `Konfirmasi Pendaftaran - ${SCHOOL_NAME}`,
    html: baseLayout("Konfirmasi Pendaftaran", body),
  };
}

export function welcomeSiswaTemplate(params: {
  nama: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}): { subject: string; html: string } {
  const body = `
    <p>Halo <strong>${esc(params.nama)}</strong>,</p>
    <p>Akun siswa Anda di ${SCHOOL_NAME} telah dibuat. Berikut detail login Anda:</p>
    <table role="presentation" cellpadding="6" style="background-color:#f1f5f9;border-radius:8px;margin:16px 0;">
      <tr><td style="color:#64748b;">Email</td><td><strong>${esc(params.email)}</strong></td></tr>
      <tr><td style="color:#64748b;">Password sementara</td><td><strong>${esc(params.tempPassword)}</strong></td></tr>
    </table>
    <p>Segera login dan ganti password Anda demi keamanan akun.</p>
    ${ctaButton(params.loginUrl, "Login ke Dashboard")}
  `;
  return {
    subject: `Akun Siswa Anda Sudah Aktif - ${SCHOOL_NAME}`,
    html: baseLayout("Selamat Datang", body),
  };
}

export function welcomeOrangTuaTemplate(params: {
  namaAnak: string;
  loginUrl: string;
}): { subject: string; html: string } {
  const body = `
    <p>Yth. Bapak/Ibu Orang Tua,</p>
    <p>Putra/putri Anda, <strong>${esc(params.namaAnak)}</strong>, telah terdaftar sebagai siswa di ${SCHOOL_NAME}. Anda dapat memantau jadwal dan nilai anak Anda melalui akun orang tua yang sudah terdaftar dengan email ini.</p>
    ${ctaButton(params.loginUrl, "Login ke Dashboard")}
  `;
  return {
    subject: `Informasi Akun Orang Tua - ${SCHOOL_NAME}`,
    html: baseLayout("Informasi Akun Orang Tua", body),
  };
}

export function welcomeGuruTemplate(params: {
  nama: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}): { subject: string; html: string } {
  const body = `
    <p>Halo <strong>${esc(params.nama)}</strong>,</p>
    <p>Akun guru Anda di ${SCHOOL_NAME} telah dibuat. Berikut detail login Anda:</p>
    <table role="presentation" cellpadding="6" style="background-color:#f1f5f9;border-radius:8px;margin:16px 0;">
      <tr><td style="color:#64748b;">Email</td><td><strong>${esc(params.email)}</strong></td></tr>
      <tr><td style="color:#64748b;">Password sementara</td><td><strong>${esc(params.tempPassword)}</strong></td></tr>
    </table>
    <p>Segera login dan ganti password Anda demi keamanan akun.</p>
    ${ctaButton(params.loginUrl, "Login ke Dashboard")}
  `;
  return {
    subject: `Akun Guru Anda Sudah Aktif - ${SCHOOL_NAME}`,
    html: baseLayout("Selamat Datang", body),
  };
}

export function nilaiUpdateTemplate(params: {
  namaSiswa: string;
  mapel: string;
  semester: number;
  nilaiAkhir: number;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const body = `
    <p>Halo,</p>
    <p>Nilai <strong>${esc(params.namaSiswa)}</strong> untuk mata pelajaran <strong>${esc(params.mapel)}</strong> (Semester ${params.semester}) telah diperbarui.</p>
    <table role="presentation" cellpadding="6" style="background-color:#f1f5f9;border-radius:8px;margin:16px 0;">
      <tr><td style="color:#64748b;">Nilai Akhir</td><td><strong>${params.nilaiAkhir}</strong></td></tr>
    </table>
    ${ctaButton(params.dashboardUrl, "Lihat Detail Nilai")}
  `;
  return {
    subject: `Update Nilai ${params.mapel} - ${params.namaSiswa}`,
    html: baseLayout("Update Nilai", body),
  };
}
