import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

export async function deleteUploadedFile(urlPath) {
  if (!urlPath || typeof urlPath !== "string") {
    return;
  }

  // Strip query strings or hash
  let clean = urlPath.split("?")[0].split("#")[0].trim();

  // If full URL (http://... or https://...), extract pathname
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    try {
      const parsed = new URL(clean);
      clean = parsed.pathname;
    } catch {
      // fallback
    }
  }

  // Get base filename
  const filename = path.basename(clean);
  if (!filename || filename === "." || filename === "/" || filename === "\\") {
    return;
  }

  // Candidate directories where uploads might be stored across local dev and production
  const candidateDirs = [
    process.env.UPLOADS_DIR,
    // Server folder variants (if cwd is project root or server root)
    path.resolve("src/uploads"),
    path.resolve("uploads"),
    path.resolve("server/src/uploads"),
    path.resolve("server/uploads"),
    path.resolve("../server/src/uploads"),
    path.resolve("../server/uploads"),
    // Common relative paths
    path.join(process.cwd(), "server", "src", "uploads"),
    path.join(process.cwd(), "server", "uploads"),
    path.join(process.cwd(), "src", "uploads"),
    path.join(process.cwd(), "uploads"),
    // Public/dist upload mirrors if any
    path.resolve("public/uploads"),
    path.resolve("../public/uploads"),
    path.resolve("dist/uploads"),
    path.resolve("../dist/uploads"),
    // Absolute paths on local machine
    "D:\\sparrow\\airaproperties\\server\\src\\uploads",
    "D:\\sparrow\\airaproperties\\server\\uploads",
    // Hostinger production paths
    "/home/u859202671/domains/api.airaproperties.in/uploads",
    "/home/u859202671/domains/airaproperties.in/public_html/uploads"
  ].filter(Boolean);

  // Remove duplicates
  const uniqueDirs = Array.from(new Set(candidateDirs));

  // Determine potential companion files (e.g. if filename is .webp, check for original .jpg/.png/.jpeg, or vice versa)
  const ext = path.extname(filename).toLowerCase();
  const baseNameWithoutExt = path.basename(filename, ext);
  const potentialExtensions = [
    ext,
    ".webp",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".mp4",
    ".mov",
    ".webm"
  ];

  let deletedCount = 0;

  for (const dir of uniqueDirs) {
    if (!fsSync.existsSync(dir)) continue;

    // 1. Delete exact file
    const exactFilePath = path.join(dir, filename);
    try {
      await fs.access(exactFilePath);
      await fs.unlink(exactFilePath);
      console.log(`[DELETE UPLOAD] Successfully deleted file: ${exactFilePath}`);
      deletedCount++;
    } catch {
      // File not present here, ignore
    }

    // 2. If it was an image, also check for any sibling files with the same basename (e.g. original vs webp)
    if ([".webp", ".jpg", ".jpeg", ".png"].includes(ext)) {
      for (const otherExt of potentialExtensions) {
        if (otherExt === ext) continue;
        const siblingPath = path.join(dir, `${baseNameWithoutExt}${otherExt}`);
        try {
          await fs.access(siblingPath);
          await fs.unlink(siblingPath);
          console.log(`[DELETE UPLOAD] Successfully deleted sibling file: ${siblingPath}`);
          deletedCount++;
        } catch {
          // Ignore
        }
      }
    }
  }

  if (deletedCount === 0) {
    console.log(`[DELETE UPLOAD] File "${filename}" not found in any upload directories.`);
  }
}
