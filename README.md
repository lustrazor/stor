# Image Storage and Display Test Project

This project serves as a proof of concept for implementing persistent storage in Coolify deployments using Docker Compose and custom Dockerfile configurations. It's built with [Next.js](https://nextjs.org) and demonstrates proper handling of user-uploaded files across container deployments.

## Project Purpose

The main goal of this project was to verify that:
1. Coolify correctly handles persistent storage volumes as specified in docker-compose.yml
2. User-uploaded data (images) persists across deployments
3. File permissions and ownership are properly maintained in the Docker environment

## Key Implementation Details

### Docker Configuration
The project uses a custom Docker setup with several important components:

```yaml
# docker-compose.yml
services:
  web:
    volumes:
      - uploads:/app/public/uploads:rw
    user: "1001:1001"  # Run as nextjs user

volumes:
  uploads:
    driver: local
```

### File System Initialization
A custom entrypoint script ensures proper setup of the upload directory:

```bash
# docker-entrypoint.sh
# Copy any pre-existing uploads to the volume
if [ -d "/app/initial-uploads" ]; then
  cp -r /app/initial-uploads/* /app/public/uploads/ 2>/dev/null || true
fi

# Ensure proper permissions
chown -R nextjs:nodejs /app/public/uploads
chmod -R 755 /app/public/uploads
```

## Challenges Encountered and Solutions

### 1. Storage Persistence
- **Challenge**: Ensuring uploaded files survive container rebuilds
- **Solution**: Implemented named volume in docker-compose.yml and proper volume mounting
- **Key**: Using the correct file permissions and ownership in the container

### 2. Image Display Issues
- **Initial Problem**: Images were visible in thumbnails but not in the modal view
- **Root Cause**: Overcomplicated image loading logic with multiple competing approaches
- **Solution**: 
  - Simplified the image loading process
  - Removed unnecessary CORS workarounds
  - Streamlined the image serving API route
  - Implemented proper cache control headers

### 3. File Permissions
- **Challenge**: Ensuring the Next.js application could read/write files
- **Solution**: Implemented proper user/group permissions in Docker
- **Key**: Using the correct user (1001:1001) and chmod/chown commands

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Notes

- The application uses the App Router in Next.js 14
- Images are served through a custom API route to handle proper headers and CORS
- File operations are handled securely with proper error handling and validation
- The UI provides immediate feedback for upload/delete operations

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Coolify Documentation](https://coolify.io/docs)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
