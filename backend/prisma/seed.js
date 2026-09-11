import { createHash } from 'node:crypto';
import { PrismaClient, AcquisitionStage, CompensationStatus, ProjectStatus, RiskLevel, RoleCode } from '@prisma/client';

const prisma = new PrismaClient();

function hashDemoPassword(password) {
    return createHash('sha256').update(`bhoomisetu-demo:${password}`).digest('hex');
}

async function clearDatabase() {
    await prisma.auditLog.deleteMany();
    await prisma.syncLog.deleteMany();
    await prisma.dataSource.deleteMany();
    await prisma.fieldVerification.deleteMany();
    await prisma.riskAlert.deleteMany();
    await prisma.document.deleteMany();
    await prisma.rrEntitlement.deleteMany();
    await prisma.rrFamily.deleteMany();
    await prisma.compensation.deleteMany();
    await prisma.award.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.acquisitionStageHistory.deleteMany();
    await prisma.acquisitionCase.deleteMany();
    await prisma.projectParcel.deleteMany();
    await prisma.parcelOwner.deleteMany();
    await prisma.parcel.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.district.deleteMany();
    await prisma.state.deleteMany();
}

async function seed() {
    await clearDatabase();

    const roleIds = new Map();
    for (const code of Object.values(RoleCode)) {
        const role = await prisma.role.create({
            data: { code, name: code.replaceAll('_', ' ') }
        });
        roleIds.set(code, role.id);
    }

    const assam = await prisma.state.create({
        data: { code: 'AS', name: 'Assam' }
    });
    const odisha = await prisma.state.create({
        data: { code: 'OD', name: 'Odisha' }
    });

    const kamrup = await prisma.district.create({
        data: { code: 'AS-KM', name: 'Kamrup Metropolitan', stateId: assam.id }
    });
    const nagaon = await prisma.district.create({
        data: { code: 'AS-NG', name: 'Nagaon', stateId: assam.id }
    });
    const khordha = await prisma.district.create({
        data: { code: 'OD-KH', name: 'Khordha', stateId: odisha.id }
    });

    const admin = await prisma.user.create({
        data: {
            name: 'National Demo Administrator',
            email: 'admin@bhoomisetu.demo',
            passwordHash: hashDemoPassword('demo-admin-password'),
            roleId: roleIds.get(RoleCode.NATIONAL_ADMIN)
        }
    });
    const stateOfficer = await prisma.user.create({
        data: {
            name: 'Assam State Officer',
            email: 'state.assam@bhoomisetu.demo',
            passwordHash: hashDemoPassword('demo-state-password'),
            roleId: roleIds.get(RoleCode.STATE_OFFICER),
            stateId: assam.id
        }
    });
    const districtOfficer = await prisma.user.create({
        data: {
            name: 'Kamrup District Officer',
            email: 'kamrup.officer@bhoomisetu.demo',
            passwordHash: hashDemoPassword('demo-officer-password'),
            roleId: roleIds.get(RoleCode.DISTRICT_OFFICER),
            stateId: assam.id,
            districtId: kamrup.id
        }
    });
    const acquisitionOfficer = await prisma.user.create({
        data: {
            name: 'Acquisition Officer',
            email: 'acquisition@bhoomisetu.demo',
            passwordHash: hashDemoPassword('demo-acquisition-password'),
            roleId: roleIds.get(RoleCode.ACQUISITION_OFFICER),
            stateId: assam.id,
            districtId: kamrup.id
        }
    });
    const financeOfficer = await prisma.user.create({
        data: {
            name: 'Finance Officer',
            email: 'finance@bhoomisetu.demo',
            passwordHash: hashDemoPassword('demo-finance-password'),
            roleId: roleIds.get(RoleCode.FINANCE_OFFICER),
            stateId: assam.id,
            districtId: kamrup.id
        }
    });
    const rrOfficer = await prisma.user.create({
        data: {
            name: 'R&R Officer',
            email: 'rr@bhoomisetu.demo',
            passwordHash: hashDemoPassword('demo-rr-password'),
            roleId: roleIds.get(RoleCode.RR_OFFICER),
            stateId: assam.id,
            districtId: kamrup.id
        }
    });
    await prisma.user.create({
        data: {
            name: 'Assam Field Officer',
            email: 'field.assam@bhoomisetu.demo',
            passwordHash: hashDemoPassword('demo-field-password'),
            roleId: roleIds.get(RoleCode.FIELD_OFFICER),
            stateId: assam.id,
            districtId: kamrup.id
        }
    });

    const projectOne = await prisma.project.create({
        data: {
            code: 'AS-RIVER-001',
            name: 'Brahmaputra River Corridor',
            description: 'Synthetic demonstration project for parcel impact analysis.',
            department: 'Department of Water Resources',
            stateId: assam.id,
            districtId: kamrup.id,
            status: ProjectStatus.ACTIVE,
            startDate: new Date('2026-01-15'),
            targetDate: new Date('2027-12-31'),
            createdById: admin.id
        }
    });
    const projectTwo = await prisma.project.create({
        data: {
            code: 'AS-HIGHWAY-002',
            name: 'North Guwahati Connector',
            description: 'Synthetic demonstration highway acquisition project.',
            department: 'Public Works Department',
            stateId: assam.id,
            districtId: nagaon.id,
            status: ProjectStatus.PROPOSED,
            startDate: new Date('2026-04-01'),
            targetDate: new Date('2028-06-30'),
            createdById: districtOfficer.id
        }
    });

    const source = await prisma.dataSource.create({
        data: {
            name: 'ASSAM_DEMO_IMPORT',
            description: 'Synthetic Assam BhuNaksha and Dharitree adapter input.'
        }
    });

    const parcels = [];
    for (let index = 0; index < 60; index += 1) {
        const district = index % 3 === 0 ? nagaon : kamrup;
        const parcel = await prisma.parcel.create({
            data: {
                stateId: assam.id,
                districtId: district.id,
                circle: district === kamrup ? 'North Guwahati' : 'Raha',
                village: `Demo Village ${String((index % 12) + 1).padStart(2, '0')}`,
                dagNo: `DAG-${String(index + 1).padStart(4, '0')}`,
                pattaNo: `PATTA-${String(index + 1).padStart(4, '0')}`,
                ulpin: `AS-DEMO-${String(index + 1).padStart(5, '0')}`,
                area: 10000,
                sourceSystem: 'ASSAM_DEMO_IMPORT',
                sourceId: `ASSAM-SOURCE-${String(index + 1).padStart(5, '0')}`
            }
        });
        await prisma.parcelOwner.create({
            data: {
                parcelId: parcel.id,
                name: `Synthetic Landholder ${String(index + 1).padStart(3, '0')}`,
                identifier: `DEMO-ID-${String(index + 1).padStart(5, '0')}`,
                ownershipPct: index % 7 === 0 ? 60 : 100,
                isVerified: index % 4 !== 0
            }
        });
        if (index % 7 === 0) {
            await prisma.parcelOwner.create({
                data: {
                    parcelId: parcel.id,
                    name: `Synthetic Co-owner ${String(index + 1).padStart(3, '0')}`,
                    identifier: `DEMO-CO-${String(index + 1).padStart(5, '0')}`,
                    ownershipPct: 40,
                    isVerified: false
                }
            });
        }
        parcels.push(parcel);
    }

    for (let index = 0; index < parcels.length; index += 1) {
        const parcel = parcels[index];
        const project = index < 35 ? projectOne : projectTwo;
        const stage = index % 5 === 0 ? AcquisitionStage.COMPENSATION : AcquisitionStage.SURVEY;
        const projectParcel = await prisma.projectParcel.create({
            data: {
                projectId: project.id,
                parcelId: parcel.id,
                affectedArea: index % 5 === 0 ? 5000 : 3500,
                affectedPercentage: index % 5 === 0 ? 50 : 35,
                acquisitionStage: stage,
                compensationStatus: index % 5 === 0 ? CompensationStatus.PENDING : CompensationStatus.ASSESSED,
                riskLevel: index % 7 === 0 ? RiskLevel.HIGH : index % 3 === 0 ? RiskLevel.MEDIUM : RiskLevel.LOW
            }
        });
        const acquisitionCase = await prisma.acquisitionCase.create({
            data: {
                projectParcelId: projectParcel.id,
                currentStage: stage,
                remarks: 'Synthetic demo acquisition record.'
            }
        });
        await prisma.acquisitionStageHistory.create({
            data: {
                acquisitionCaseId: acquisitionCase.id,
                newStage: AcquisitionStage.PROPOSAL,
                changedById: districtOfficer.id,
                remarks: 'Synthetic case created from seed data.'
            }
        });
        if (stage !== AcquisitionStage.PROPOSAL) {
            await prisma.acquisitionStageHistory.create({
                data: {
                    acquisitionCaseId: acquisitionCase.id,
                    previousStage: AcquisitionStage.PROPOSAL,
                    newStage: stage,
                    changedById: districtOfficer.id,
                    remarks: 'Synthetic stage progression.'
                }
            });
        }
        await prisma.compensation.create({
            data: {
                acquisitionCaseId: acquisitionCase.id,
                assessedAmount: 1250000,
                approvedAmount: index % 5 === 0 ? null : 1200000,
                paidAmount: 0,
                status: index % 5 === 0 ? CompensationStatus.PENDING : CompensationStatus.ASSESSED,
                assessmentDate: new Date('2026-06-15')
            }
        });
        await prisma.rrFamily.create({
            data: {
                projectParcelId: projectParcel.id,
                familyReference: `RR-DEMO-${String(index + 1).padStart(4, '0')}`,
                membersCount: 3 + (index % 4),
                eligible: index % 2 === 0,
                status: index % 2 === 0 ? 'ELIGIBLE' : 'UNDER_REVIEW',
                resettlementProgress: index % 2 === 0 ? 25 : 0,
                entitlements: {
                    create: {
                        entitlementType: 'TRANSITION_SUPPORT',
                        amount: 75000,
                        status: 'PENDING'
                    }
                }
            }
        });
        if (index % 7 === 0) {
            await prisma.riskAlert.create({
                data: {
                    projectId: project.id,
                    projectParcelId: projectParcel.id,
                    level: RiskLevel.HIGH,
                    score: 82,
                    reasons: ['Multiple ownership records', 'Compensation pending'],
                    recommendedAction: 'Review compensation and ownership verification.'
                }
            });
        }
    }

    await prisma.syncLog.create({
        data: {
            dataSourceId: source.id,
            startedAt: new Date('2026-09-01T09:00:00Z'),
            completedAt: new Date('2026-09-01T09:02:00Z'),
            status: 'COMPLETED',
            recordsRead: 60,
            recordsWritten: 60,
            rawSnapshotRef: 'synthetic://assam-demo-import/2026-09-01'
        }
    });

    await prisma.auditLog.create({
        data: {
            userId: admin.id,
            action: 'SEED_DATA_CREATED',
            entity: 'DATABASE',
            entityId: 'phase-2-demo',
            newValue: { projects: 2, parcels: 60, synthetic: true }
        }
    });

    console.log('Seed complete: 2 states, 3 districts, 2 projects, 60 parcels, and related demo records.');
}

seed()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
