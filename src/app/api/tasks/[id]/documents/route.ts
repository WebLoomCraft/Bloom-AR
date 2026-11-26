import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { billingTasks, taskDocuments, users } from '@/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { createAuditLog } from '@/lib/audit';
import { requireTenantContext } from '@/lib/tenant-context';
import { isSupervisorOrAbove } from '@/lib/auth';
import { canViewUser } from '@/lib/rbac';
import { validateDocumentUpload, sanitizeFileName } from '@/lib/security/files';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireTenantContext();
    if (!auth.ok) return auth.response;
    const { organizationId } = auth.ctx;

    const { id } = await params;

    const [task] = await db
      .select({ id: billingTasks.id })
      .from(billingTasks)
      .where(and(eq(billingTasks.id, id), eq(billingTasks.organizationId, organizationId)))
      .limit(1);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const documents = await db
      .select({
        id: taskDocuments.id,
        documentType: taskDocuments.documentType,
        fileName: taskDocuments.fileName,
        mimeType: taskDocuments.mimeType,
        fileSize: taskDocuments.fileSize,
        status: taskDocuments.status,
        reviewComments: taskDocuments.reviewComments,
        createdAt: taskDocuments.createdAt,
        uploadedBy: taskDocuments.uploadedBy,
        uploaderName: users.firstName,
        uploaderLastName: users.lastName,
      })
      .from(taskDocuments)
      .leftJoin(users, eq(taskDocuments.uploadedBy, users.id))
      .where(and(eq(taskDocuments.taskId, id), eq(taskDocuments.organizationId, organizationId)))
      .orderBy(desc(taskDocuments.createdAt));

    return NextResponse.json({
      documents: documents.map((d) => ({
        ...d,
        uploaderName:
          d.uploaderName && d.uploaderLastName
            ? `${d.uploaderName} ${d.uploaderLastName}`
            : 'Unknown',
      })),
    });
  } catch (error) {
    console.error('Get task documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireTenantContext({ allowMutation: true });
    if (!auth.ok) return auth.response;
    const { ctx } = auth;
    const { user, organizationId } = ctx;

    const { id } = await params;

    const [task] = await db
      .select()
      .from(billingTasks)
      .where(and(eq(billingTasks.id, id), eq(billingTasks.organizationId, organizationId)))
      .limit(1);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File and document type are required' },
        { status: 400 }
      );
    }

    if (
      !isSupervisorOrAbove(user.role) &&
      task.assignedBy !== user.id &&
      task.assignedTo !== user.id &&
      (!task.assignedTo || !(await canViewUser(user, task.assignedTo, organizationId)))
    ) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const verdict = validateDocumentUpload(file.name, file.size, buffer);
    if (!verdict.ok) {
      return NextResponse.json({ error: verdict.error }, { status: verdict.status || 400 });
    }
    const safeFileName = sanitizeFileName(file.name);
    const fileData = buffer.toString('base64');

    const [document] = await db
      .insert(taskDocuments)
      .values({
        organizationId,
        taskId: id,
        documentType,
        fileName: safeFileName,
        fileData,
        mimeType: verdict.mimeType!,
        fileSize: file.size,
        uploadedBy: user.id,
        status: 'pending',
      })
      .returning();

    await createAuditLog({
      organizationId,
      userId: user.id,
      actorRole: ctx.orgRole,
      action: 'task_document_uploaded',
      entityType: 'taskDocument',
      entityId: document.id,
      newValue: { taskId: id, documentType, fileName: safeFileName },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      document: {
        id: document.id,
        documentType: document.documentType,
        fileName: document.fileName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload task document error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
