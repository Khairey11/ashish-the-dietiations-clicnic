import { unlink } from "node:fs/promises";
import path from "node:path";

/**
 * Delete a file from /public/uploads/ by its URL path.
 *
 * Safely handles:
 *   - null / undefined / empty URLs (no-op)
 *   - URLs that don't start with `/uploads/` (no-op — refuses to delete
 *     arbitrary filesystem paths)
 *   - Path traversal attempts like `/uploads/../../../etc/passwd` (no-op)
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
  // SECURITY: Resolve the absolute path and verify it's within the uploads
  // directory to prevent path traversal (CWE-22).
  const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(process.cwd(), "public", cleanUrl);
  if (!filePath.startsWith(uploadsDir + path.sep)) {
    // Path traversal attempt — refuse to delete.
    console.warn(`Refusing to delete file outside uploads dir: ${filePath}`);
    return;
  }
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