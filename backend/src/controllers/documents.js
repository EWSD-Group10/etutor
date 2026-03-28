import path from "path";
import fs from "fs";
import { prisma } from "../utils/prisma.js";
import { DOCUMENTS_UPLOAD_DIR } from "../utils/documentUpload.js";
import {
  isAllowedStudentDocument,
  STUDENT_DOCUMENT_ERROR,
} from "../utils/documentValidation.js";
import { hasStudentTutorLink } from "../utils/relationship.js";
import { createNotification } from "./notifications.js";

const documentSelect = {
  id: true,
  fileName: true,
  filePath: true,
  fileSize: true,
  fileFormat: true,
  uploadedAt: true,
  uploader: { select: { id: true, name: true, role: true } },
};

async function getVisibleUploaderIds(userId, role) {
  if (role === "student") {
    return [userId];
  }
  if (role === "tutor") {
    const tutees = await prisma.allocation.findMany({
      where: { tutorId: userId },
      select: { studentId: true },
    });
    return [userId, ...tutees.map((t) => t.studentId)];
  }
  return [];
}

function resolveDiskPath(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/^\/+/, "");
  if (normalized.startsWith("uploads/")) {
    return path.join(process.cwd(), normalized);
  }
  if (normalized.startsWith("documents/")) {
    return path.join(DOCUMENTS_UPLOAD_DIR, path.basename(normalized));
  }
  return path.join(DOCUMENTS_UPLOAD_DIR, path.basename(filePath));
}

// GET /api/documents
export const listDocuments = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!me) return res.status(404).json({ error: "User not found" });

    if (me.role === "admin") {
      const data = await prisma.document.findMany({
        orderBy: { uploadedAt: "desc" },
        select: documentSelect,
      });
      return res.json({ data });
    }

    const rawStudentId = req.query.studentId;
    const filterStudentId =
      typeof rawStudentId === "string" && rawStudentId.trim() ? rawStudentId.trim() : null;

    if (filterStudentId) {
      if (me.role !== "tutor") {
        return res.status(403).json({ error: "Not allowed" });
      }
      const allowed = await hasStudentTutorLink(filterStudentId, userId);
      if (!allowed) {
        return res.status(403).json({ error: "Not allowed" });
      }
      const data = await prisma.document.findMany({
        where: { uploaderId: filterStudentId },
        orderBy: { uploadedAt: "desc" },
        select: documentSelect,
      });
      return res.json({ data });
    }

    const uploaderIds = await getVisibleUploaderIds(userId, me.role);
    if (uploaderIds.length === 0) {
      return res.json({ data: [] });
    }

    const data = await prisma.document.findMany({
      where: { uploaderId: { in: uploaderIds } },
      orderBy: { uploadedAt: "desc" },
      select: documentSelect,
    });
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/documents (multipart: field "file")
export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!me || (me.role !== "student" && me.role !== "tutor")) {
      return res.status(403).json({ error: "Only students and tutors can upload" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded (use field name \"file\")" });
    }

    if (me.role === "student") {
      const ok = isAllowedStudentDocument(file.mimetype, file.originalname);
      if (!ok) {
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          console.error(e);
        }
        return res.status(400).json({ error: STUDENT_DOCUMENT_ERROR });
      }
    }

    const relativePath = `documents/${file.filename}`;
    const uploader = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const doc = await prisma.document.create({
      data: {
        uploaderId: userId,
        fileName: file.originalname || file.filename,
        filePath: relativePath,
        fileSize: file.size,
        fileFormat: file.mimetype || "application/octet-stream",
      },
      select: documentSelect,
    });

    // Notify assigned student when tutor uploads a document
    if (me.role === "tutor") {
      const allocation = await prisma.allocation.findMany({
        where: { tutorId: userId },
        select: { studentId: true },
      });
      for (const { studentId } of allocation) {
        createNotification({
          userId: studentId,
          type: "new_document",
          title: "New Document Shared",
          message: `${uploader?.name || "Your tutor"} shared "${file.originalname || file.filename}" with you.`,
          metadata: { documentId: doc.id, fileName: file.originalname || file.filename },
        });
      }
    }

    return res.status(201).json({ data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/documents/:id/download
export const downloadDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!me) return res.status(404).json({ error: "User not found" });

    const doc = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        fileName: true,
        filePath: true,
        fileSize: true,
        fileFormat: true,
        uploadedAt: true,
        uploaderId: true,
        uploader: { select: { id: true, name: true, role: true } },
      },
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (me.role === "student" && doc.uploaderId !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    } else if (me.role !== "admin" && me.role !== "student") {
      const visible = await getVisibleUploaderIds(userId, me.role);
      if (!visible.includes(doc.uploaderId)) {
        return res.status(403).json({ error: "Not allowed" });
      }
    }

    const diskPath = resolveDiskPath(doc.filePath);
    if (!diskPath || !fs.existsSync(diskPath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    return res.download(diskPath, doc.fileName || "download");
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/documents/:id — uploader only
export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const doc = await prisma.document.findUnique({
      where: { id },
      select: { id: true, uploaderId: true, filePath: true },
    });
    if (!doc) return res.status(404).json({ error: "Document not found" });
    if (doc.uploaderId !== userId) {
      return res.status(403).json({ error: "You can only delete your own uploads" });
    }

    await prisma.comment.deleteMany({ where: { documentId: id } });

    const diskPath = resolveDiskPath(doc.filePath);
    if (diskPath && fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch (e) {
        console.error(e);
      }
    }

    await prisma.document.delete({ where: { id } });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
