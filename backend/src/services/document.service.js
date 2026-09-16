import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';

const versionInclude = { uploadedBy: { select: { id: true, name: true, email: true } } };

async function getDocument(id) {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found');
    return document;
}

function assertUploader(document, user) {
    const allowedRoles = new Set(['NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER']);
    if (document.uploadedById !== user.sub && !allowedRoles.has(user.role)) {
        throw new AppError(403, 'FORBIDDEN', 'You do not have permission to manage this document');
    }
}

export async function listVersions(id) {
    await getDocument(id);
    return prisma.documentVersion.findMany({ where: { documentId: id }, include: versionInclude, orderBy: { version: 'desc' } });
}

export async function createVersion(id, input, user) {
    const document = await getDocument(id);
    assertUploader(document, user);
    if (!input.storageReference || typeof input.storageReference !== 'string') {
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
        return created;
    });
}