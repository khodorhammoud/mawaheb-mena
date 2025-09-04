#!/bin/bash
set -e

echo "Starting CMS database restoration..."

# Check if the dump file exists in the same directory
DUMP_FILE="/docker-entrypoint-initdb.d/mawahev-cms.dump"
if [ -f "$DUMP_FILE" ]; then
    echo "Found CMS dump file. Restoring to mawaheb-cms database..."
    
    # Restore the dump file to the mawaheb-cms database
    # The dump file contains CREATE TABLE statements and data
    PGPASSWORD="$POSTGRES_PASSWORD" psql -U "$POSTGRES_USER" -d "mawaheb-cms" -f "$DUMP_FILE"
    
    echo "CMS database restoration completed successfully!"
else
    echo "Warning: CMS dump file not found at $DUMP_FILE"
    echo "Available files in init directory:"
    ls -la /docker-entrypoint-initdb.d/
    echo "Skipping CMS data restoration..."
fi

echo "Database initialization process completed." 