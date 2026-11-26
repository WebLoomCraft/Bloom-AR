/**
 * Upload validation shared by the AR import routes. Checks extension,
 * size, and — importantly — the file's actual magic bytes, so a renamed
 * executable or archive cannot masquerade as a spreadsheet.
 */
export const UPLOAD_MAX_BYTES = 25 * 1024 * 1024; // 25 MB
export const UPLOAD_ALLOWED_EXTENSIONS = ['xlsx', 'xls', 'csv'] as const;

export function uploadExtension(fileName: string): string {
  return (fileName.split('.').pop() || '').toLowerCase();
}

export function validateUploadMeta(
  fileName: string,
  size: number
): { ok: boolean; error?: string; status?: number } {
  const ext = uploadExtension(fileName);
  if (!(UPLOAD_ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid file type. Supported formats: .xlsx, .xls, .csv',
    };
  }
  if (size <= 0) {
    return { ok: false, status: 400, error: 'The uploaded file is empty.' };
  }
  if (size > UPLOAD_MAX_BYTES) {
    return {
      ok: false,
      status: 413,
      error: 'The uploaded file exceeds the 25MB maximum size limit. Please upload a smaller file or split the records.',
    };
  }
  return { ok: true };
}

/** Magic-byte check: xlsx is a ZIP, legacy xls is an OLE compound file, csv is text. */
export function validateUploadSignature(ext: string, bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  if (ext === 'xlsx') {
    // ZIP local-file header "PK\x03\x04"
    return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  }
  if (ext === 'xls') {
    // OLE2 compound document D0 CF 11 E0
    return bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
  }
  if (ext === 'csv') {
    // Reject anything with NUL/control bytes typical of binaries in the head.
    const head = bytes.subarray(0, Math.min(bytes.length, 1024));
    for (const b of head) {
      if (b === 0) return false;
    }
    return true;
  }
  return false;
}

/* ------------------------------------------------------------------ */
/* Document / attachment uploads (claim, authorization, task, chat).  */
/* The spreadsheet helpers above stay as-is for AR imports; documents */
/* use their own allow-list + signature checks so active content      */
/* (HTML/SVG/scripts) can never be stored or later served inline.     */
/* ------------------------------------------------------------------ */

export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const CHAT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const DOCUMENT_ALLOWED_EXTENSIONS = [
  'pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'txt', 'csv',
  'xlsx', 'xls', 'doc', 'docx',
] as const;

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  txt: 'text/plain',
  csv: 'text/csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** Strip path separators, control chars and header-breaking characters. */
export function sanitizeFileName(name: string | null | undefined): string {
  const base = String(name || 'file')
    .split(/[\\/]/)
    .pop()!
    .replace(/[\u0000-\u001f\u007f"'\r\n]/g, '_')
    .trim();
  return (base || 'file').slice(0, 200);
}

/** Magic-byte signature check per document extension. */
export function validateDocumentSignature(ext: string, bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  switch (ext) {
    case 'pdf':
      return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
    case 'png':
      return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    case 'jpg':
    case 'jpeg':
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case 'gif':
      return bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38; // GIF8
    case 'webp':
      return (
        bytes.length >= 12 &&
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
      );
    case 'xlsx':
    case 'docx': // OOXML = ZIP
      return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
    case 'xls':
    case 'doc': // OLE2
      return bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0;
    case 'txt':
    case 'csv': {
      const head = bytes.subarray(0, Math.min(bytes.length, 1024));
      for (const b of head) if (b === 0) return false;
      return true;
    }
    default:
      return false;
  }
}

/**
 * Full document-upload verdict: allow-listed extension, non-empty, size cap
 * (413 when oversized), and content signature matching the extension. The
 * client-declared MIME type is never consulted.
 */
export function validateDocumentUpload(
  fileName: string,
  size: number,
  bytes: Uint8Array,
  maxBytes: number = DOCUMENT_MAX_BYTES
): { ok: boolean; status?: number; error?: string; mimeType?: string } {
  const ext = uploadExtension(sanitizeFileName(fileName));
  if (!(DOCUMENT_ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid file type. Allowed: PDF, PNG, JPG, GIF, WEBP, TXT, CSV, XLSX, XLS, DOC, DOCX.',
    };
  }
  if (size <= 0) return { ok: false, status: 400, error: 'The uploaded file is empty.' };
  if (size > maxBytes) {
    return {
      ok: false,
      status: 413,
      error: `The uploaded file exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB maximum size limit.`,
    };
  }
  if (!validateDocumentSignature(ext, bytes)) {
    return {
      ok: false,
      status: 400,
      error: 'File content does not match its extension. Upload rejected.',
    };
  }
  return { ok: true, mimeType: MIME_BY_EXTENSION[ext] };
}

/**
 * Content-Type to serve on download, derived from the file name extension —
 * never from the stored/client-supplied MIME type — so a legacy row uploaded
 * as text/html is downloaded as an inert attachment, never rendered.
 */
export function safeDownloadContentType(fileName: string | null | undefined): string {
  const ext = uploadExtension(sanitizeFileName(fileName));
  return MIME_BY_EXTENSION[ext] || 'application/octet-stream';
}

export function safeDownloadHeaders(fileName: string | null | undefined): Record<string, string> {
  const safe = sanitizeFileName(fileName);
  return {
    'Content-Type': safeDownloadContentType(safe),
    'Content-Disposition': `attachment; filename="${safe}"`,
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
  };
}
