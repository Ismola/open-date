import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config } from "@/lib/config";

let client: S3Client | undefined;

function storageConfig() {
  const missing = [
    ["S3_ENDPOINT", config.s3.endpoint],
    ["S3_BUCKET", config.s3.bucket],
    ["S3_ACCESS_KEY_ID", config.s3.accessKeyId],
    ["S3_SECRET_ACCESS_KEY", config.s3.secretAccessKey],
    ["S3_PUBLIC_URL", config.s3.publicUrl],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    throw new Error(`Faltan variables de almacenamiento: ${missing.join(", ")}`);
  }

  return config.s3;
}

function getClient() {
  const storage = storageConfig();
  client ??= new S3Client({
    endpoint: storage.endpoint,
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
  });
  return client;
}

export async function uploadPublicImage(key: string, body: Uint8Array, contentType: string) {
  const storage = storageConfig();
  await getClient().send(new PutObjectCommand({
    Bucket: storage.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  }));

  return `${storage.publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
