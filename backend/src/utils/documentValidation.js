import path from "path";

/** Allowed for student uploads: PDF, Word, Excel, PowerPoint */
const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const ALLOWED_EXT = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
]);

export function isAllowedStudentDocument(mimetype, originalname) {
  const ext = path.extname(originalname || "").toLowerCase();
  if (ALLOWED_EXT.has(ext)) return true;
  if (mimetype && ALLOWED_MIMES.has(mimetype)) return true;
  return false;
}

export const STUDENT_DOCUMENT_ERROR =
  "Only PDF, Word (.doc, .docx), Excel (.xls, .xlsx), and PowerPoint (.ppt, .pptx) files are allowed.";
