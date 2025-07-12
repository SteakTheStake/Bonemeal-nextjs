# LabPBR Texture Converter

## Overview

This is a full-stack web application that converts standard textures to LabPBR format, which is a standard for physically based rendering (PBR) in shader packs. The application provides a modern React frontend with texture processing capabilities on the backend, designed to help texture artists and developers convert their materials to the LabPBR specification.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend concerns:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **File Processing**: Sharp for image manipulation
- **File Upload**: Multer for handling multipart/form-data

## Key Components

### Database Schema
The application uses two main tables:
- `conversion_jobs`: Tracks conversion tasks with status, progress, settings, and timestamps
- `texture_files`: Stores individual texture file information with validation results

### Image Processing Pipeline
1. **Texture Processor**: Handles image manipulation and generates PBR maps
2. **LabPBR Converter**: Validates textures against LabPBR specification
3. **Zip Handler**: Manages resource pack extraction and creation

### Frontend Components
- **Upload Zone**: Drag-and-drop file upload interface
- **Conversion Settings**: Configurable processing parameters
- **Texture Preview**: Visual feedback during processing
- **Progress Panel**: Real-time processing status
- **Validation Panel**: LabPBR compliance checking
- **Batch Panel**: Multi-file processing management

## Data Flow

1. User uploads texture files or resource packs through the upload zone
2. Files are processed server-side with configurable settings
3. Images are validated against LabPBR standards
4. Progress updates are sent to the frontend via polling
5. Converted textures are packaged and made available for download

## External Dependencies

### Frontend Dependencies
- **Radix UI**: Comprehensive component library for accessibility
- **TanStack Query**: Server state synchronization
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Backend Dependencies
- **Sharp**: High-performance image processing
- **Drizzle ORM**: Type-safe database queries
- **JSZip**: JavaScript ZIP file creation/extraction
- **Multer**: File upload middleware

### Database
- **PostgreSQL**: Primary database with Neon Database serverless hosting
- **Drizzle Kit**: Database migration and schema management

## Deployment Strategy

The application is configured for development and production environments:

### Development
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Database schema management with Drizzle Kit
- Replit-specific plugins for development environment

### Production
- Vite build process generates optimized static assets
- esbuild bundles server code for Node.js deployment
- Environment variables manage database connections
- Static file serving integrated with Express

### Key Features
- **Real-time Updates**: Progress tracking with 1-second polling intervals
- **Batch Processing**: Multiple file/resource pack conversion
- **Validation**: LabPBR specification compliance checking
- **Dark Theme**: Custom dark mode optimized for texture work
- **Mobile Responsive**: Adaptive UI for different screen sizes
- **Advanced Processing**: Professional-grade texture processing tools
  - **Bulk Resize**: Independent resolution control for base color, specular, and normal maps
  - **Smart Interpolation**: Per-texture-type interpolation methods (nearest, linear, cubic, lanczos)
  - **Compression**: File size optimization with light diffusion dithering
  - **CTM Split**: OptiFine Connected Textures Mod format generation with up to 47 variations

### Recent Changes
- **2025-01-12**: Added advanced processing suite with bulk resize, compression, and CTM split capabilities
- **2025-01-12**: Implemented professional three-panel UI with tabbed settings (Basic/Advanced)
- **2025-01-12**: Added support for independent texture resolution control (16x to 2048x)
- **2025-01-12**: Integrated smart interpolation algorithms for optimal texture quality at all resolutions

The architecture prioritizes developer experience with TypeScript throughout, modern tooling, and clear separation of concerns while maintaining performance for image processing operations.