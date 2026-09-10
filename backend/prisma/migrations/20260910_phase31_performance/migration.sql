CREATE INDEX IF NOT EXISTS parcel_geometry_gist ON "Parcel" USING GIST (geometry);
CREATE INDEX IF NOT EXISTS project_geometry_gist ON "Project" USING GIST (geometry);

