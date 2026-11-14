import { NextRequest, NextResponse } from 'next/server';
import { canUploadFiles } from '@/lib/auth';
import { inspectWorkbook, CANONICAL_FIELDS } from '@/lib/file-parser';
import { requireTenantContext } from '@/lib/tenant-context';
import { validateUploadMeta, validateUploadSignature, uploadExtension } from '@/lib/security/files';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTenantContext({ allowMutation: true });
    if (!auth.ok) return auth.response;
    const { user } = auth.ctx;

    if (!canUploadFiles(user.role)) {
      return NextResponse.json(
        {
          error:
            'You do not have permission to upload AR files. Required role: Administrator, Supervisor, Manager, or Senior Lead.',
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sheetName = formData.get('sheetName') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = fileName.split('.').pop()?.toLowerCase() || '';

    const metaCheck = validateUploadMeta(fileName, file.size);
    if (!metaCheck.ok) {
      return NextResponse.json({ error: metaCheck.error }, { status: metaCheck.status ?? 400 });
    }
    const headBytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
    if (!validateUploadSignature(uploadExtension(fileName), headBytes)) {
      return NextResponse.json(
        { error: 'The file content does not match its extension. Upload a genuine .xlsx, .xls, or .csv file.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const inspection = inspectWorkbook(buffer, fileName, sheetName || undefined);
      return NextResponse.json({
        success: true,
        inspection,
        canonicalFields: CANONICAL_FIELDS,
      });
    } catch (parseError: unknown) {
      const msg =
        parseError instanceof Error
          ? parseError.message
          : 'The Excel file could not be read. Please check that the file is not password-protected or corrupted and try again.';
      console.error('Workbook inspection error:', parseError);
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Inspect API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while analyzing the file.' },
      { status: 500 }
    );
  }
}
