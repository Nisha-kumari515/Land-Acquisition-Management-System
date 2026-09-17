CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('NATIONAL_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'ACQUISITION_OFFICER', 'FINANCE_OFFICER', 'RR_OFFICER', 'FIELD_OFFICER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PROPOSED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AcquisitionStage" AS ENUM ('PROPOSAL', 'SCRUTINY', 'SURVEY', 'NOTIFICATION', 'AWARD', 'COMPENSATION', 'POSSESSION', 'RR', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CompensationStatus" AS ENUM ('PENDING', 'ASSESSED', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "code" "RoleCode" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "stateId" TEXT,
    "districtId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "districtId" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PROPOSED',
    "startDate" TIMESTAMP(3),
    "targetDate" TIMESTAMP(3),
    "geometry" geometry,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parcel" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "circle" TEXT,
    "village" TEXT NOT NULL,
    "dagNo" TEXT,
    "pattaNo" TEXT,
    "ulpin" TEXT,
    "area" DECIMAL(14,4) NOT NULL,
    "geometry" geometry,
    "sourceSystem" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcelOwner" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT,
    "ownershipPct" DECIMAL(5,2),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParcelOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectParcel" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "affectedArea" DECIMAL(14,4) NOT NULL,
    "affectedPercentage" DECIMAL(6,2) NOT NULL,
    "acquisitionStage" "AcquisitionStage" NOT NULL DEFAULT 'PROPOSAL',
    "compensationStatus" "CompensationStatus" NOT NULL DEFAULT 'PENDING',
    "possessionDate" TIMESTAMP(3),
    "rrStatus" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectParcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcquisitionCase" (
    "id" TEXT NOT NULL,
    "projectParcelId" TEXT NOT NULL,
    "currentStage" "AcquisitionStage" NOT NULL DEFAULT 'PROPOSAL',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcquisitionCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcquisitionStageHistory" (
    "id" TEXT NOT NULL,
    "acquisitionCaseId" TEXT NOT NULL,
    "previousStage" "AcquisitionStage",
    "newStage" "AcquisitionStage" NOT NULL,
    "changedById" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcquisitionStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "acquisitionCaseId" TEXT NOT NULL,
    "notificationNo" TEXT NOT NULL,
    "notificationDate" TIMESTAMP(3) NOT NULL,
    "publicationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "acquisitionCaseId" TEXT NOT NULL,
    "awardNo" TEXT NOT NULL,
    "awardDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(16,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compensation" (
    "id" TEXT NOT NULL,
    "acquisitionCaseId" TEXT NOT NULL,
    "assessedAmount" DECIMAL(16,2) NOT NULL,
    "approvedAmount" DECIMAL(16,2),
    "paidAmount" DECIMAL(16,2) NOT NULL DEFAULT 0,
    "status" "CompensationStatus" NOT NULL DEFAULT 'PENDING',
    "assessmentDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compensation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RrFamily" (
    "id" TEXT NOT NULL,
    "projectParcelId" TEXT NOT NULL,
    "familyReference" TEXT NOT NULL,
    "membersCount" INTEGER NOT NULL,
    "eligible" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "resettlementProgress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RrFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RrEntitlement" (
    "id" TEXT NOT NULL,
    "rrFamilyId" TEXT NOT NULL,
    "entitlementType" TEXT NOT NULL,
    "amount" DECIMAL(16,2),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RrEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "projectId" TEXT,
    "parcelId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "storageRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAlert" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "projectParcelId" TEXT,
    "level" "RiskLevel" NOT NULL,
    "score" INTEGER NOT NULL,
    "reasons" JSONB NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldVerification" (
    "id" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "verifiedById" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FieldVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "recordsRead" INTEGER NOT NULL DEFAULT 0,
    "recordsWritten" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "rawSnapshotRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_stateId_idx" ON "User"("stateId");

-- CreateIndex
CREATE INDEX "User_districtId_idx" ON "User"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE UNIQUE INDEX "District_code_key" ON "District"("code");

-- CreateIndex
CREATE INDEX "District_stateId_idx" ON "District"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE INDEX "Project_stateId_idx" ON "Project"("stateId");

-- CreateIndex
CREATE INDEX "Project_districtId_idx" ON "Project"("districtId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_ulpin_key" ON "Parcel"("ulpin");

-- CreateIndex
CREATE INDEX "Parcel_stateId_idx" ON "Parcel"("stateId");

-- CreateIndex
CREATE INDEX "Parcel_districtId_idx" ON "Parcel"("districtId");

-- CreateIndex
CREATE INDEX "Parcel_village_idx" ON "Parcel"("village");

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_sourceSystem_sourceId_key" ON "Parcel"("sourceSystem", "sourceId");

-- CreateIndex
CREATE INDEX "ParcelOwner_parcelId_idx" ON "ParcelOwner"("parcelId");

-- CreateIndex
CREATE INDEX "ProjectParcel_projectId_idx" ON "ProjectParcel"("projectId");

-- CreateIndex
CREATE INDEX "ProjectParcel_parcelId_idx" ON "ProjectParcel"("parcelId");

-- CreateIndex
CREATE INDEX "ProjectParcel_acquisitionStage_idx" ON "ProjectParcel"("acquisitionStage");

-- CreateIndex
CREATE INDEX "ProjectParcel_riskLevel_idx" ON "ProjectParcel"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectParcel_projectId_parcelId_key" ON "ProjectParcel"("projectId", "parcelId");

-- CreateIndex
CREATE UNIQUE INDEX "AcquisitionCase_projectParcelId_key" ON "AcquisitionCase"("projectParcelId");

-- CreateIndex
CREATE INDEX "AcquisitionStageHistory_acquisitionCaseId_idx" ON "AcquisitionStageHistory"("acquisitionCaseId");

-- CreateIndex
CREATE INDEX "AcquisitionStageHistory_changedById_idx" ON "AcquisitionStageHistory"("changedById");

-- CreateIndex
CREATE INDEX "Notification_acquisitionCaseId_idx" ON "Notification"("acquisitionCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Award_acquisitionCaseId_key" ON "Award"("acquisitionCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Compensation_acquisitionCaseId_key" ON "Compensation"("acquisitionCaseId");

-- CreateIndex
CREATE INDEX "RrFamily_projectParcelId_idx" ON "RrFamily"("projectParcelId");

-- CreateIndex
CREATE INDEX "RrEntitlement_rrFamilyId_idx" ON "RrEntitlement"("rrFamilyId");

-- CreateIndex
CREATE INDEX "Document_projectId_idx" ON "Document"("projectId");

-- CreateIndex
CREATE INDEX "Document_parcelId_idx" ON "Document"("parcelId");

-- CreateIndex
CREATE INDEX "RiskAlert_projectId_idx" ON "RiskAlert"("projectId");

-- CreateIndex
CREATE INDEX "RiskAlert_projectParcelId_idx" ON "RiskAlert"("projectParcelId");

-- CreateIndex
CREATE INDEX "RiskAlert_level_idx" ON "RiskAlert"("level");

-- CreateIndex
CREATE INDEX "FieldVerification_parcelId_idx" ON "FieldVerification"("parcelId");

-- CreateIndex
CREATE INDEX "FieldVerification_verifiedById_idx" ON "FieldVerification"("verifiedById");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_name_key" ON "DataSource"("name");

-- CreateIndex
CREATE INDEX "SyncLog_dataSourceId_idx" ON "SyncLog"("dataSourceId");

-- CreateIndex
CREATE INDEX "SyncLog_status_idx" ON "SyncLog"("status");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelOwner" ADD CONSTRAINT "ParcelOwner_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectParcel" ADD CONSTRAINT "ProjectParcel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectParcel" ADD CONSTRAINT "ProjectParcel_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionCase" ADD CONSTRAINT "AcquisitionCase_projectParcelId_fkey" FOREIGN KEY ("projectParcelId") REFERENCES "ProjectParcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionStageHistory" ADD CONSTRAINT "AcquisitionStageHistory_acquisitionCaseId_fkey" FOREIGN KEY ("acquisitionCaseId") REFERENCES "AcquisitionCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcquisitionStageHistory" ADD CONSTRAINT "AcquisitionStageHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_acquisitionCaseId_fkey" FOREIGN KEY ("acquisitionCaseId") REFERENCES "AcquisitionCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_acquisitionCaseId_fkey" FOREIGN KEY ("acquisitionCaseId") REFERENCES "AcquisitionCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compensation" ADD CONSTRAINT "Compensation_acquisitionCaseId_fkey" FOREIGN KEY ("acquisitionCaseId") REFERENCES "AcquisitionCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RrFamily" ADD CONSTRAINT "RrFamily_projectParcelId_fkey" FOREIGN KEY ("projectParcelId") REFERENCES "ProjectParcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RrEntitlement" ADD CONSTRAINT "RrEntitlement_rrFamilyId_fkey" FOREIGN KEY ("rrFamilyId") REFERENCES "RrFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAlert" ADD CONSTRAINT "RiskAlert_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAlert" ADD CONSTRAINT "RiskAlert_projectParcelId_fkey" FOREIGN KEY ("projectParcelId") REFERENCES "ProjectParcel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldVerification" ADD CONSTRAINT "FieldVerification_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldVerification" ADD CONSTRAINT "FieldVerification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncLog" ADD CONSTRAINT "SyncLog_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
