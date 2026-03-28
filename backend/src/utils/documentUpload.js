import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DOCUMENTS_UPLOAD_DIR = path.join(__dirname, "../../uploads/documents");

fs.mkdirSync(DOCUMENTS_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, DOCUMENTS_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}${ext}`;
    cb(null, safe);
  },
});

export const documentUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});
