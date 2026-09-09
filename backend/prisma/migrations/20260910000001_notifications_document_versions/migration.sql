ALTER TABLE "Notification"
  ALTER COLUMN "acquisitionCaseId" DROP NOT NULL,
  ALTER COLUMN "notificationNo" DROP NOT NULL,
  ALTER COLUMN "notificationDate" DROP NOT NULL;

ALTER TABLE "Notification"
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'STATUTORY_NOTICE',
  ADD COLUMN IF NOT EXISTS "title" TEXT,
  ADD COLUMN IF NOT EXISTS "message" TEXT,
  ADD COLUMN IF NOT EXISTS "eventKey" TEXT,
  ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "projectId" TEXT,
  ADD COLUMN IF NOT EXISTS "parcelId" TEXT,
  ADD COLUMN IF NOT EXISTS "riskAlertId" TEXT,
  ADD COLUMN IF NOT EXISTS "syncLogId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Notification_eventKey_key" ON "Notification" ("eventKey");
CREATE INDEX IF NOT EXISTS "Notification_readAt_idx" ON "Notification" ("readAt");
CREATE INDEX IF NOT EXISTS "Notification_type_idx" ON "Notification" ("type");
CREATE INDEX IF NOT EXISTS "Notification_projectId_idx" ON "Notification" ("projectId");
CREATE INDEX IF NOT EXISTS "Notification_parcelId_idx" ON "Notification" ("parcelId");

DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "Parcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_riskAlertId_fkey" FOREIGN KEY ("riskAlertId") REFERENCES "RiskAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Notification" ADD CONSTRAINT "Notification_syncLogId_fkey" FOREIGN KEY ("syncLogId") REFERENCES "SyncLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "DocumentVersion" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "storageReference" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "changeReason" TEXT,
  "isCurrent" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DocumentVersion_documentId_version_key" ON "DocumentVersion" ("documentId", "version");
CREATE INDEX IF NOT EXISTS "DocumentVersion_documentId_isCurrent_idx" ON "DocumentVersion" ("documentId", "isCurrent");
DO $$ BEGIN
  ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
