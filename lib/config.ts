export const config = {
  mongoUri:
    process.env.MONGODB_URI ?? "mongodb://mongo:27017/open_date",
  mongoDatabase: process.env.MONGODB_DATABASE ?? "open_date",
  authSecret:
    process.env.AUTH_SECRET ?? "open-date-local-secret-change-in-production",
  sessionCookie: process.env.SESSION_COOKIE_NAME ?? "open_date_session",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  adminEmailDomain: (process.env.ADMIN_EMAIL_DOMAIN ?? "ismola.dev")
    .replace(/^@/, "")
    .toLowerCase(),
  uploadDir: process.env.UPLOAD_DIR ?? "./data/uploads",
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? "8"),
};

export function isAdminEmail(email: string) {
  return email.toLowerCase().endsWith(`@${config.adminEmailDomain}`);
}
