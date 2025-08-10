# Bonemeal - LabPBR Texture Converter

## Overview

Bonemeal is a full-stack web application that converts standard textures to LabPBR format for Minecraft shader packs. Named after Minecraft's growth-enhancing bonemeal, this tool helps "grow" your productivity through automated texture processing. The application provides a modern React frontend with advanced texture processing capabilities on the backend, designed to help texture artists and developers convert their materials to the LabPBR specification.

## User Preferences

Preferred communication style: Simple, everyday language.
App name: "Bonemeal" - emphasizing productivity growth through automation
Branding: Minecraft enchanted bonemeal gif as logo, growth/productivity theme
Theme: Bright chalky glassmorphism with earthy off-white textures and subtle organic patterns
Visual style: Living, growing elements with glassmorphism effects, moss and vine textures, bright chalky backgrounds

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
- **Greenhouse**: Unified texture automation workspace with 6 main views
- **Upload Zone**: Drag-and-drop file upload interface
- **Conversion Settings**: Configurable processing parameters
- **Texture Preview**: Visual feedback during processing
- **Progress Panel**: Real-time processing status
- **Validation Panel**: LabPBR compliance checking
- **Batch Panel**: Multi-file processing management
- **Project Dashboard**: Visual project management with grid and stats
- **Texture Editor**: Visual editing tools with real-time preview
- **AI Generator**: AI-powered texture creation with style presets
- **Template Library**: Pre-configured material templates
- **Batch Processor**: Bulk processing pipeline

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
- **Mobile Responsive**: Adaptive UI for different screen sizes with hamburger menu navigation
- **Progressive Web App**: Installable mobile app with offline functionality and service worker caching
- **SEO Optimized**: Comprehensive meta tags, structured data, and social media rich embeds
- **Discord Integration**: Rich embed support with custom branding and feature highlights
- **Advanced Processing**: Professional-grade texture processing tools
  - **Bulk Resize**: Independent resolution control for base color, specular, and normal maps
  - **Smart Interpolation**: Per-texture-type interpolation methods (nearest, linear, cubic, lanczos)
  - **Compression**: File size optimization with light diffusion dithering
  - **CTM Split**: OptiFine Connected Textures Mod format generation with up to 47 variations

### Recent Changes
- **2025-01-12**: Fixed critical system-wide functionality issues - restored upload and processing capabilities
- **2025-01-12**: Implemented complete project management system with CRUD operations
- **2025-01-12**: Created comprehensive homepage showcasing features, stats, and workflow
- **2025-01-12**: Added Projects page with create, edit, delete functionality and project cards
- **2025-01-12**: Integrated project-job relationship in database schema
- **2025-01-12**: Implemented all backend routes for projects API (/api/projects endpoints)
- **2025-01-12**: Fixed storage layer to support both projects and conversion jobs
- **2025-01-12**: Resolved all TypeScript type issues and LSP diagnostics
- **2025-01-12**: Successfully tested all core functionality - projects, uploads, conversions working
- **2025-01-12**: Maintained mid-tone earthy theme with glassmorphism and organic textures throughout
- **2025-01-17**: Transformed into comprehensive texture automation suite with Studio interface
- **2025-01-17**: Added visual texture editor with real-time preview and adjustment controls
- **2025-01-17**: Implemented AI texture generation with style presets and custom prompts
- **2025-01-17**: Created template library with pre-configured texture templates and material presets
- **2025-01-17**: Built batch processing pipeline for handling multiple texture files simultaneously
- **2025-01-17**: Added project dashboard with visual grid, kanban view, and comprehensive stats
- **2025-01-17**: Integrated all features into unified Studio interface with tabbed navigation
- **2025-01-17**: Implemented Discord OAuth authentication with passport-discord integration
- **2025-01-17**: Added user authentication system with PostgreSQL session storage
- **2025-01-17**: Created professional navigation bar with user avatars and dropdown menus
- **2025-01-17**: Built comprehensive LabPBR 1.3 documentation with interactive tabbed interface
- **2025-01-17**: Fixed FormData handling in upload system for proper file processing
- **2025-01-17**: Established complete database schema with users, sessions, and projects tables
- **2025-01-17**: Implemented sophisticated light/dark theme system with chalky bonemeal powder aesthetic
- **2025-01-17**: Added Three.js water dripping animations throughout UI to enhance growth theme
- **2025-01-17**: Created theme-aware color palette with desaturated chalky tones for both modes
- **2025-01-17**: Enhanced UI with glassmorphism effects, organic textures, and theme toggle functionality
- **2025-01-17**: Merged Converter and Studio into unified "Greenhouse" page with comprehensive texture automation
- **2025-01-17**: Created intuitive navigation system with Convert, Projects, Editor, AI Generate, Templates, and Batch views
- **2025-01-17**: Established greenhouse metaphor perfectly aligning with growth theme and bonemeal branding
- **2025-08-08**: Added comprehensive Reference tab to Docs page with links to professional texture tools
- **2025-08-08**: Integrated GIMP, Substance Suite, PhotoGIMP, Bulk Rename Utility, and Python automation resources
- **2025-08-08**: Implemented advanced image processing with specialized interpolation methods per texture type
- **2025-08-08**: Added albedo texture processing with Lanczos + pixel-perfect blending at 50% opacity
- **2025-08-08**: Configured bilinear interpolation for normal maps and Lanczos for specular textures
- **2025-08-08**: Created AI upscaling feature using Stable Diffusion for 1024x1024 textures
- **2025-08-08**: Built configuration interface for AI server with public IP and port settings
- **2025-08-08**: Ensured AI upscaling maintains LabPBR compliance, seamless tiling, and vector data integrity
- **2025-08-08**: Fixed passport deserialization error with graceful null user handling
- **2025-08-08**: Optimized water particle system with realistic rain physics and anti-freeze mechanisms
- **2025-08-08**: Enhanced text contrast in Docs page using theme-aware semantic colors
- **2025-08-08**: Updated validation logic to treat emission value 255 as intentionally disabled emission (not error)
- **2025-08-08**: Enhanced texture quality analyzer with emission handling analysis and proper 255 value recognition
- **2025-08-08**: Made footer plants more densely packed with varied sizes (24 plants + 16 grass tufts, 0.3x-2.4x scale)
- **2025-08-08**: Replaced complex Three.js water simulation with simple line particle rain animation for better performance
- **2025-08-08**: Completely overhauled Projects dashboard with 5-tab interface: Overview, Files, Issues, Analytics, Processing, History
- **2025-08-08**: Added file navigation system with working directory display, breadcrumbs, and image previews
- **2025-08-08**: Implemented comprehensive project management with CRUD operations and file browser
- **2025-08-08**: Enhanced Projects dashboard with error tracking, processing monitoring, and detailed analytics
- **2025-08-08**: Created enhanced project dashboard with real API integration and project creation functionality
- **2025-08-09**: Implemented comprehensive Progressive Web App (PWA) functionality with mobile installation support
- **2025-08-09**: Added extensive SEO optimization with Open Graph, Twitter Cards, and Discord rich embed support
- **2025-08-09**: Created detailed structured data markup for search engine optimization and app discovery
- **2025-08-09**: Implemented service worker for offline functionality, caching strategies, and background sync
- **2025-08-09**: Added PWA installation prompt component with glassmorphism design matching app theme
- **2025-08-09**: Updated favicon and icons to use enchanted bonemeal logo throughout application
- **2025-08-09**: Enhanced mobile viewport configuration and app manifest for proper mobile installation
- **2025-08-09**: Integrated push notification support and app shortcuts for common actions
- **2025-08-09**: Added comprehensive meta tags for social media sharing and search engine indexing
- **2025-01-13**: Implemented uploaded content library with database persistence and Library tab in Greenhouse
- **2025-01-13**: Integrated PayPal donation system with professional modal and navbar Support button
- **2025-01-13**: Achieved complete mobile/desktop feature parity - removed all mobile restrictions
- **2025-01-13**: Fixed Discord authentication to use correct /api/auth/discord endpoints
- **2025-01-13**: Made Greenhouse fully responsive with tabbed mobile layout for all 8 feature views
- **2025-01-13**: Added hamburger menu navigation for mobile devices with dropdown menu
- **2025-01-13**: Enhanced responsive design with proper breakpoints and touch-optimized controls
- **2025-01-13**: Added custom scrollbar styles for improved mobile navigation experience

The architecture prioritizes developer experience with TypeScript throughout, modern tooling, and clear separation of concerns while maintaining performance for image processing operations.