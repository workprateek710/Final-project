import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const uploadDir = path.join(process.cwd(), "public", "uploads");
const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const maxBytes = 4 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ message: "No file found." }, { status: 400 });
    }
    if (!allowedMimeTypes.has(file.type)) {
      return Response.json({ message: "Only image files are allowed." }, { status: 400 });
    }
    if (file.size > maxBytes) {
      return Response.json({ message: "Image must be 4MB or smaller." }, { status: 400 });
    }

    await mkdir(uploadDir, { recursive: true });
    const safeName = sanitizeFileName(file.name || "upload-image");
    const fileName = `${Date.now()}-${randomUUID()}-${safeName}`;
    const diskPath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(diskPath, Buffer.from(bytes));

    return Response.json({
      url: `/uploads/${fileName}`,
      fileKey: `localupload:${fileName}`,
    });
  } catch (error) {
    return Response.json(
      { message: "Image upload failed.", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { fileKey } = await request.json();
    if (typeof fileKey !== "string" || !fileKey.startsWith("localupload:")) {
      return Response.json({ message: "Invalid file key." }, { status: 400 });
    }

    const fileName = fileKey.replace("localupload:", "");
    const diskPath = path.join(uploadDir, fileName);
    await unlink(diskPath).catch(() => {
      // Cleanup should not fail hard if file does not exist.
    });
    return Response.json({ message: "Image deleted." });
  } catch (error) {
    return Response.json(
      { message: "Image delete failed.", error: String(error) },
      { status: 500 }
    );
  }
}
