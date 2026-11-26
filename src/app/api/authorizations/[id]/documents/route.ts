import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { authDocuments, authorizations } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireTenantContext } from '@/lib/tenant-context';
import { canViewUser } from '@/lib/rbac';
import { validateDocumentUpload, sanitizeFileName } from '@/lib/security/files';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authRes = await requireTenantContext({ allowMutation: true });
    if (!authRes.ok) return authRes.response;
    const { user, organizationId } = authRes.ctx;
    const { id } = await params;

    const [auth] = await db
      .select()
      .from(authorizations)
      .where(and(eq(authorizations.id, id), eq(authorizations.organizationId, organizationId)))
      .limit(1);
    if (!auth) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (
      !['administrator', 'supervisor', 'manager'].includes(user.role) &&
      auth.assignedBy !== user.id &&
      (!auth.assignedTo || !(await canViewUser(user, auth.assignedTo, organizationId)))
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'File required' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const verdict = validateDocumentUpload(file.name, file.size, buffer);
    if (!verdict.ok) {
      return NextResponse.json({ error: verdict.error }, { status: verdict.status || 400 });
    }
    const safeFileName = sanitizeFileName(file.name);
    const [doc] = await db
      .insert(authDocuments)
      .values({
        organizationId,
        authId: id,
        fileName: safeFileName,
        fileData: buffer.toString('base64'),
        mimeType: verdict.mimeType!,
        fileSize: file.size,
        uploadedBy: user.id,
      })
      .returning();

    return NextResponse.json({
      document: {
        id: doc.id,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        createdAt: doc.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload auth document error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
