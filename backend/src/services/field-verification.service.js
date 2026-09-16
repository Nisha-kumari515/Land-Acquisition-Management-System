import { prisma } from '../config/database.js';
import { AppError } from '../utils/response.js';

const statuses = new Set(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'VERIFIED', 'REJECTED']);
const include = {
    parcel: { select: { id: true, village: true, dagNo: true, pattaNo: true, ulpin: true } },
    project: { select: { id: true, name: true, code: true } },
    assignedOfficer: { select: { id: true, name: true, email: true } },
    verifiedBy: { select: { id: true, name: true, email: true } }
};

function validate(input) {
    if (!input.parcelId) throw new AppError(400, 'VALIDATION_ERROR', 'parcelId is required');
    if (!input.projectId) throw new AppError(400, 'VALIDATION_ERROR', 'projectId is required');
    if (input.verificationStatus && !statuses.has(input.verificationStatus)) throw new AppError(400, 'VALIDATION_ERROR', 'verificationStatus is invalid');
    if (input.latitude !== undefined && (Number(input.latitude) < -90 || Number(input.latitude) > 90)) throw new AppError(400, 'VALIDATION_ERROR', 'latitude must be between -90 and 90');
    if (input.longitude !== undefined && (Number(input.longitude) < -180 || Number(input.longitude) > 180)) throw new AppError(400, 'VALIDATION_ERROR', 'longitude must be between -180 and 180');
}

async function audit(userId, action, id, previousValue, newValue) {
    await prisma.auditLog.create({ data: { userId, action, entity: 'FIELD_VERIFICATION', entityId: id, previousValue, newValue } });
}

async function notify(title, message, parcelId, projectId) {
    await prisma.notification.create({
        data: {
            title,
            message,
            parcelId,
            projectId,
            type: 'SYSTEM_ALERT',
            notificationDate: new Date()
        }
    });
}

export async function list(query = {}) {
    return prisma.fieldVerification.findMany({ where: query.verificationStatus ? { verificationStatus: query.verificationStatus } : undefined, include, orderBy: { createdAt: 'desc' }, take: 100 });
}
export async function get(id) {
    const item = await prisma.fieldVerification.findUnique({ where: { id }, include });
    if (!item) throw new AppError(404, 'FIELD_VERIFICATION_NOT_FOUND', 'Field verification not found');
    return item;
}
export async function create(input, userId) {
    validate(input);
    const parcel = await prisma.parcel.findUnique({ where: { id: input.parcelId } });
    if (!parcel) throw new AppError(404, 'PARCEL_NOT_FOUND', 'Parcel not found');
    const project = await prisma.project.findUnique({ where: { id: input.projectId } });
    if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
    
    const verificationStatus = input.verificationStatus ?? 'PENDING';
    const item = await prisma.fieldVerification.create({ data: {
        parcelId: input.parcelId, projectId: input.projectId, assignedOfficerId: input.assignedOfficerId ?? userId,
        verificationStatus: verificationStatus, latitude: input.latitude ?? null, longitude: input.longitude ?? null,
        remarks: input.remarks ?? null, photoReference: input.photoReference ?? null,
        verifiedById: verificationStatus === 'VERIFIED' ? userId : null, verifiedAt: verificationStatus === 'VERIFIED' ? new Date() : null
    }, include });
    
    await audit(userId, 'FIELD_VERIFICATION_CREATED', item.id, null, { verificationStatus: item.verificationStatus, parcelId: item.parcelId });
    
    if (item.verificationStatus === 'ASSIGNED' || item.verificationStatus === 'VERIFIED') {
        await notify(`Field Verification ${item.verificationStatus}`, `Verification ${item.verificationStatus} for parcel ${item.parcelId}`, item.parcelId, item.projectId);
    }
    
    return item;
}
export async function update(id, input, userId) {
    const existing = await get(id);
    validate({ parcelId: existing.parcelId, projectId: existing.projectId || input.projectId || 'placeholder', ...input });
    const verificationStatus = input.verificationStatus ?? existing.verificationStatus;
    const item = await prisma.fieldVerification.update({ where: { id }, data: {
        assignedOfficerId: input.assignedOfficerId ?? existing.assignedOfficerId, verificationStatus,
        latitude: input.latitude ?? existing.latitude, longitude: input.longitude ?? existing.longitude,
        remarks: input.remarks ?? existing.remarks, photoReference: input.photoReference ?? existing.photoReference,
        verifiedById: verificationStatus === 'VERIFIED' ? userId : existing.verifiedById, verifiedAt: verificationStatus === 'VERIFIED' ? (existing.verifiedAt ?? new Date()) : existing.verifiedAt
    }, include });
    
    await audit(userId, 'FIELD_VERIFICATION_UPDATED', id, { verificationStatus: existing.verificationStatus }, { verificationStatus: item.verificationStatus });
    
    if (existing.verificationStatus !== item.verificationStatus && (item.verificationStatus === 'ASSIGNED' || item.verificationStatus === 'VERIFIED')) {
        await notify(`Field Verification ${item.verificationStatus}`, `Verification ${item.verificationStatus} for parcel ${item.parcelId}`, item.parcelId, item.projectId);
    }
    
    return item;
}