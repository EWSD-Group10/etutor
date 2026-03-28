export type DocumentFormatCategory = "pdf" | "doc" | "xls" | "ppt" | "other";

const PDF_HINTS = /pdf/i;
const DOC_HINTS = /word|msword|document|\.doc|\.docx/i;
const XLS_HINTS = /sheet|excel|\.xls|\.xlsx|\.csv/i;
const PPT_HINTS = /powerpoint|presentation|\.ppt|\.pptx/i;

export function getFormatCategory(fileName: string, fileFormat?: string | null): DocumentFormatCategory {
  const blob = `${fileName} ${fileFormat || ""}`;
  if (PDF_HINTS.test(blob)) return "pdf";
  if (DOC_HINTS.test(blob)) return "doc";
  if (XLS_HINTS.test(blob)) return "xls";
  if (PPT_HINTS.test(blob)) return "ppt";
  return "other";
}

export function formatCategoryLabel(cat: DocumentFormatCategory): string {
  switch (cat) {
    case "pdf":
      return "PDF";
    case "doc":
      return "DOC";
    case "xls":
      return "XLS";
    case "ppt":
      return "PPT";
    default:
      return "OTHER";
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb >= 10 ? kb.toFixed(0) : kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

/** HTML file input accept (extensions; validation also checks MIME in code) */
export const STUDENT_DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"]);

const ALLOWED_MIME_PREFIXES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export function isAllowedStudentUploadFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot) : "";
  if (ALLOWED_EXT.has(ext)) return true;
  const t = (file.type || "").toLowerCase();
  return ALLOWED_MIME_PREFIXES.some((m) => t === m);
}

export const STUDENT_UPLOAD_HINT =
  "PDF, Word (.doc, .docx), Excel (.xls, .xlsx), or PowerPoint (.ppt, .pptx) only.";
