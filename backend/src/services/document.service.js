import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';
import { getPagination, paginatedResponse } from '../utils/pagination.js';

const versionInclude = { uploadedBy: { select: { id: true, name: true, email: true } } };
const documentInclude = { 
    uploadedBy: { select: { id: true, name: true, email: true } },
    versions: { orderBy: { version: 'desc' }, take: 1 }
};

async function getDocument(id) {
    const document = await prisma.document.findUnique({ where: { id }, include: documentInclude });
    if (!document) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found');
    return document;
}

function assertUploader(document, user) {
    const allowedRoles = new Set(['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER']);
    if (document.uploadedById !== user.sub && !allowedRoles.has(user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to manage this document');
    }
}

export async function listDocuments(query = {}) {
    const { page, pageSize, skip, take } = getPagination(query);
    const where = {
        ...(query.projectId ? { projectId: query.projectId } : {}),
        ...(query.parcelId ? { parcelId: query.parcelId } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.isArchived !== undefined ? { isArchived: query.isArchived === 'true' } : { isArchived: false })
    };

    const [items, total] = await Promise.all([
        prisma.document.findMany({ where, include: documentInclude, orderBy: { createdAt: 'desc' }, skip, take }),
        prisma.document.count({ where })
    ]);

    return paginatedResponse(items, total, page, pageSize);
}

export async function getDocumentById(id, user) {
    const document = await getDocument(id);
    await prisma.auditLog.create({
        data: { userId: user.sub, action: 'DOCUMENT_ACCESSED', entity: 'DOCUMENT', entityId: id, newValue: { category: document.category } }
    });
    return document;
}

export async function createDocument(input, user) {
    if (!input.storageReference || !input.title || !input.category) {
        throw new AppError(400, 'VALIDATION_ERROR', 'storageReference, title, and category are required');
    }

    return prisma.$transaction(async (transaction) => {
        const document = await transaction.document.create({
            data: {
                title: input.title,
                description: input.description,
                category: input.category,
                storageRef: input.storageReference,
                mimeType: input.mimeType || 'application/octet-stream',
                fileSize: input.fileSize || 0,
                uploadedById: user.sub,
                projectId: input.projectId,
                parcelId: input.parcelId,
                version: 1
            },
            include: documentInclude
        });

        await transaction.documentVersion.create({
            data: {
                documentId: document.id,
                version: 1,
                storageReference: input.storageReference,
                uploadedById: user.sub,
                isCurrent: true,
                changeReason: 'Initial upload'
            }
        });

        await transaction.auditLog.create({
            data: { userId: user.sub, action: 'DOCUMENT_UPLOADED', entity: 'DOCUMENT', entityId: document.id, newValue: { category: document.category } }
        });

        return document;
    });
}

export async function listVersions(id) {
    await getDocument(id);
    return prisma.documentVersion.findMany({ where: { documentId: id }, include: versionInclude, orderBy: { version: 'desc' } });
}

export async function createVersion(id, input, user) {
    const document = await getDocument(id);
    assertUploader(document, user);
    if (!input.storageReference) {
        throw new AppError(400, 'VALIDATION_ERROR', 'storageReference is required');
    }

    return prisma.$transaction(async (transaction) => {
        const latest = await transaction.documentVersion.findFirst({ where: { documentId: id }, orderBy: { version: 'desc' }, select: { version: true } });
        const version = (latest?.version ?? document.version) + 1;
        await transaction.documentVersion.updateMany({ where: { documentId: id, isCurrent: true }, data: { isCurrent: false } });
        
        const created = await transaction.documentVersion.create({
            data: { documentId: id, version, storageReference: input.storageReference.trim(), uploadedById: user.sub, changeReason: input.changeReason ?? null, isCurrent: true },
            include: versionInclude
        });
        
        await transaction.document.update({ where: { id }, data: { version, storageRef: input.storageReference.trim(), uploadedById: user.sub } });
        
        await transaction.auditLog.create({
            data: { userId: user.sub, action: 'DOCUMENT_VERSION_CREATED', entity: 'DOCUMENT', entityId: id, previousValue: { version: latest?.version }, newValue: { version } }
        });
        
        return created;
    });
}

export async function archiveDocument(id, user) {
    const document = await getDocument(id);
    assertUploader(document, user);

    const archived = await prisma.document.update({
        where: { id },
        data: { isArchived: true }
    });

    await prisma.auditLog.create({
        data: { userId: user.sub, action: 'DOCUMENT_ARCHIVED', entity: 'DOCUMENT', entityId: id }
    });

    return archived;
}
