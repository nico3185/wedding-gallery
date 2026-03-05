import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const useLocalMedia = () => {
  return (
    !process.env.R2_ACCOUNT_ID ||
    process.env.R2_ACCOUNT_ID === "your_cloudflare_account_id"
  );
};

export const r2 = !useLocalMedia()
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export type MediaItem = {
  key: string;
  url: string;
  type: "image" | "video";
  album: string;
  filename: string;
  livePhotoUrl?: string; // companion .mov for iPhone Live Photos
  size?: number;
};

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);
const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm"]);

function ext(key: string) {
  return key.slice(key.lastIndexOf(".")).toLowerCase();
}
function base(key: string) {
  return key.slice(0, key.lastIndexOf("."));
}

/**
 * List local media files from public/media folder
 * Used in development when R2 credentials are not configured
 */
async function listLocalMedia(prefix = ""): Promise<MediaItem[]> {
  try {
    const mediaPath = join(process.cwd(), "public", "media");
    const items: MediaItem[] = [];
    const allKeys = new Map<
      string,
      { key: string; size?: number; mtime?: number }
    >();

    // Recursively scan directories
    const scanDir = (dir: string, relPrefix = "") => {
      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;

          if (entry.isDirectory()) {
            scanDir(fullPath, relPath);
          } else if (entry.isFile()) {
            const stats = statSync(fullPath);
            allKeys.set(relPath, {
              key: relPath,
              size: stats.size,
              mtime: stats.mtimeMs,
            });
          }
        }
      } catch (e) {
        // Silently skip inaccessible directories
      }
    };

    scanDir(mediaPath);

    // Filter by prefix and process like R2 media
    for (const [key, obj] of allKeys) {
      if (prefix && !key.startsWith(prefix)) continue;

      const e = ext(key);
      const isImage = IMAGE_EXTS.has(e);
      const isVideo = VIDEO_EXTS.has(e);

      if (!isImage && !isVideo) continue;

      const parts = key.split("/");
      const album = parts.length > 1 ? parts[0] : "all";
      const filename = parts[parts.length - 1];

      // Skip .mov files that are Live Photo companions
      if (e === ".mov" && isVideo) {
        const imgKey = base(key) + ".jpg";
        const imgKeyHeic = base(key) + ".heic";
        if (allKeys.has(imgKey) || allKeys.has(imgKeyHeic)) continue;
      }

      // Check for Live Photo companion
      let livePhotoUrl: string | undefined;
      if (isImage) {
        const liveKey = base(key) + ".mov";
        if (allKeys.has(liveKey)) {
          livePhotoUrl = `/media/${liveKey}`;
        }
      }

      items.push({
        key,
        url: `/media/${key}`,
        type: isImage ? "image" : "video",
        album,
        filename,
        livePhotoUrl,
        size: obj.size,
      });
    }

    // Sort: images before videos, then by filename
    return items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "image" ? -1 : 1;
      return a.filename.localeCompare(b.filename);
    });
  } catch (e) {
    console.error("Error reading local media:", e);
    return [];
  }
}

export async function listMedia(prefix = ""): Promise<MediaItem[]> {
  // Use local media in development when R2 is not configured
  if (useLocalMedia()) {
    return listLocalMedia(prefix);
  }

  const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!.replace(/\/$/, "");
  const allKeys = new Map<string, { key: string; size?: number }>();
  let token: string | undefined;

  // Fetch ALL keys from R2
  do {
    const cmd = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      Prefix: prefix,
      ContinuationToken: token,
      MaxKeys: 1000,
    });
    const res = await r2!.send(cmd);
    token = res.NextContinuationToken;
    for (const obj of res.Contents ?? []) {
      if (obj.Key) allKeys.set(obj.Key, { key: obj.Key, size: obj.Size });
    }
  } while (token);

  const items: MediaItem[] = [];

  for (const [key, obj] of allKeys) {
    const e = ext(key);
    const isImage = IMAGE_EXTS.has(e);
    const isVideo = VIDEO_EXTS.has(e);

    if (!isImage && !isVideo) continue;

    const parts = key.split("/");
    const album = parts.length > 1 ? parts[0] : "all";
    const filename = parts[parts.length - 1];

    // Skip .mov files that are Live Photo companions (will be attached to image)
    if (e === ".mov" && isVideo) {
      const imgKey = base(key) + ".jpg";
      const imgKeyHeic = base(key) + ".heic";
      if (allKeys.has(imgKey) || allKeys.has(imgKeyHeic)) continue;
    }

    // Check for Live Photo companion: same base, .mov
    let livePhotoUrl: string | undefined;
    if (isImage) {
      const liveKey = base(key) + ".mov";
      if (allKeys.has(liveKey)) {
        livePhotoUrl = `${baseUrl}/${liveKey}`;
      }
    }

    items.push({
      key,
      url: `${baseUrl}/${key}`,
      type: isImage ? "image" : "video",
      album,
      filename,
      livePhotoUrl,
      size: obj.size,
    });
  }

  // Sort: images before standalone videos, then by filename
  return items.sort((a, b) => {
    if (a.type !== b.type) return a.type === "image" ? -1 : 1;
    return a.filename.localeCompare(b.filename);
  });
}
