import sgMail from "@sendgrid/mail";
import {
  registrationConfirmationTemplate,
  welcomeSiswaTemplate,
  welcomeGuruTemplate,
  welcomeOrangTuaTemplate,
  nilaiUpdateTemplate,
} from "@/lib/emails/templates";

const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@smu.join.co.id";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "admin@smu.join.co.id";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

let configured = false;
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  configured = true;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!configured) {
    // No SENDGRID_API_KEY configured — log instead of failing so the rest of the
    // request (e.g. creating a siswa/guru account) doesn't break in dev/test setups
    // that don't have a real email provider wired up.
    console.log(`[email:dev-mode] Would send to ${to} — subject: "${subject}"`);
    return;
  }

  try {
    await sgMail.send({ to, from: FROM_EMAIL, replyTo: REPLY_TO, subject, html });
  } catch (err) {
    console.error(`[email] Failed to send to ${to}:`, err);
  }
}

export async function sendRegistrationConfirmation(email: string, nama: string, token: string) {
  const verifyUrl = `${APP_URL}/registrasi/verify?token=${token}`;
  const { subject, html } = registrationConfirmationTemplate({ nama, verifyUrl });
  await sendEmail(email, subject, html);
}

export async function sendWelcomeSiswa(params: {
  email: string;
  nama: string;
  tempPassword: string;
  orangTuaEmail: string;
}) {
  const loginUrl = `${APP_URL}/login`;
  const siswaEmail = welcomeSiswaTemplate({
    nama: params.nama,
    email: params.email,
    tempPassword: params.tempPassword,
    loginUrl,
  });
  await sendEmail(params.email, siswaEmail.subject, siswaEmail.html);

  const orangTuaEmail = welcomeOrangTuaTemplate({ namaAnak: params.nama, loginUrl });
  await sendEmail(params.orangTuaEmail, orangTuaEmail.subject, orangTuaEmail.html);
}

export async function sendWelcomeGuru(params: {
  email: string;
  nama: string;
  tempPassword: string;
}) {
  const loginUrl = `${APP_URL}/login`;
  const { subject, html } = welcomeGuruTemplate({ ...params, loginUrl });
  await sendEmail(params.email, subject, html);
}

export async function sendNilaiUpdate(params: {
  siswaEmail: string;
  orangTuaEmail: string;
  namaSiswa: string;
  mapel: string;
  semester: number;
  nilaiAkhir: number;
}) {
  const dashboardUrl = `${APP_URL}/dashboard/siswa`;
  const { subject, html } = nilaiUpdateTemplate({
    namaSiswa: params.namaSiswa,
    mapel: params.mapel,
    semester: params.semester,
    nilaiAkhir: params.nilaiAkhir,
    dashboardUrl,
  });
  await Promise.all([
    sendEmail(params.siswaEmail, subject, html),
    sendEmail(params.orangTuaEmail, subject, html),
  ]);
}
