#!/bin/bash
# Start BHOOMISETU Application Stack

echo "Starting BHOOMISETU database and backend services..."
cd backend
docker compose up -d

echo "Showing backend logs... (Press Ctrl+C to stop services)"
# Trap Ctrl+C to stop the containers when the user exits the log view
trap "echo 'Stopping services...'; docker compose stop; exit" INT

# Follow logs
docker compose logs -f

