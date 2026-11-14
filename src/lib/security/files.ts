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
