import { unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Delete a file from /public/uploads/ by its URL path.
 *
 * Safely handles:
 *   - null / undefined / empty URLs (no-op)
 *   - URLs that don't start with `/uploads/` (no-op — refuses to delete
 *     arbitrary filesystem paths)
 *   - missing files (logs but doesn't throw)
 *
 * Always resolves — never rejects. File cleanup is best-effort: if it fails,
 * the DB delete has already happened and we don't want to roll that back
 * over a stale file.
 */
export async function deleteUploadByUrl(url: string | null | undefined): Promise<void> {
  if (!url || typeof url !== "string") return;
  // Only delete files under /uploads/ — never arbitrary paths.
  if (!url.startsWith("/uploads/")) return;
  // Strip query string / hash just in case.
  const cleanUrl = url.split("?")[0].split("#")[0];
  const filePath = path.join(process.cwd(), "public", cleanUrl);
  try {
    await unlink(filePath);
  } catch (err) {
    // ENOENT is fine — file was already gone. Anything else is worth logging.
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== "ENOENT") {
      console.error(`Failed to delete upload ${filePath}:`, err);
    }
  }
}
