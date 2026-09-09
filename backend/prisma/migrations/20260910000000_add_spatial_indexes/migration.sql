CREATE INDEX IF NOT EXISTS "Parcel_geometry_gist_idx" ON "Parcel" USING GIST (geometry);
CREATE INDEX IF NOT EXISTS "Project_geometry_gist_idx" ON "Project" USING GIST (geometry);