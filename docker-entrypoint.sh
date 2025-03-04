#!/bin/sh

# Copy any pre-existing uploads to the volume
if [ -d "/app/initial-uploads" ]; then
  cp -r /app/initial-uploads/* /app/public/uploads/ 2>/dev/null || true
fi

# Ensure proper permissions
chown -R nextjs:nodejs /app/public/uploads
chmod -R 755 /app/public/uploads

# Start the application
exec "$@" 