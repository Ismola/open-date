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
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? "8"),
  s3: {
    endpoint: process.env.S3_ENDPOINT ?? "",
    region: process.env.S3_REGION ?? "auto",
    bucket: process.env.S3_BUCKET ?? "",
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    publicUrl: (process.env.S3_PUBLIC_URL ?? "").replace(/\/$/, ""),
  },
};

export function isAdminEmail(email: string) {
  return email.toLowerCase().endsWith(`@${config.adminEmailDomain}`);
}
