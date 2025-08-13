# Bonemeal - LabPBR Texture Converter

## Overview
Bonemeal is a full-stack web application designed to convert standard textures to LabPBR format for Minecraft shader packs. Its core purpose is to automate and streamline texture processing, enhancing productivity for texture artists and developers. The application provides advanced texture processing capabilities, aiming to simplify the creation of LabPBR-compliant materials. Key capabilities include comprehensive texture conversion, validation against LabPBR specifications, and project management for texture assets. The business vision is to provide a robust, user-friendly tool that automates a common, time-consuming task in Minecraft texture pack development, offering significant market potential within the gaming modding community.

## User Preferences
Preferred communication style: Simple, everyday language.
App name: "Bonemeal" - emphasizing productivity growth through automation
Branding: Minecraft enchanted bonemeal gif as logo, growth/productivity theme
Theme: Bright chalky glassmorphism with earthy off-white textures and subtle organic patterns
Visual style: Living, growing elements with glassmorphism effects, moss and vine textures, bright chalky backgrounds

## Recent Changes
- **January 13, 2025**: Added comprehensive Discord integration for project sharing and collaboration
  - Built Discord OAuth2 authentication system with secure session management
  - Created mobile and desktop Discord sharing interfaces with touch optimization
  - Implemented friend selection, permission management (view/edit), and invite links
  - Added backend API routes for all sharing operations and collaborator management
  - Fixed routing issues with dedicated project detail pages
  - Enhanced mobile layout with responsive design patterns

## System Architecture

The application employs a modern full-stack architecture, ensuring clear separation of concerns and a robust foundation.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom dark theme
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI/UX Decisions**: Incorporates bright chalky glassmorphism with earthy off-white textures and subtle organic patterns, featuring living, growing elements and moss/vine textures. A custom dark theme is optimized for texture work. The UI is mobile-responsive with a hamburger menu and is designed as a Progressive Web App (PWA) with offline functionality and SEO optimization.
- **Key Frontend Components**: A unified "Greenhouse" workspace with views for texture automation, upload, conversion settings, texture preview, progress, validation, batch processing, project dashboard, texture editor, AI generator, and template library.

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Image Processing**: Sharp for high-performance image manipulation. Includes advanced features like bulk resizing with independent resolution control per map, smart interpolation (nearest, linear, cubic, lanczos) per texture type, compression with dithering, and CTM Split for OptiFine Connected Textures.
- **File Handling**: Multer for multipart/form-data.
- **Authentication**: Discord OAuth2 integration for seamless user access and project collaboration
- **Core Process**: Handles texture processing, LabPBR validation, resource pack management, and project sharing

### System Design Choices
- **Database Schema**: Uses `conversion_jobs` to track tasks and `texture_files` for file information and validation results.
- **Data Flow**: Users upload files, which are processed server-side, validated against LabPBR standards, and progress is reported via polling. Converted textures are then available for download.
- **Scalability**: Designed for both development (Vite, tsx) and production (optimized static assets, esbuild) environments.
- **Key Features**: Real-time progress updates, batch processing, LabPBR validation, Discord collaboration system with project sharing, mobile-first responsive design, PWA capabilities, SEO optimization, and advanced texture processing tools including AI upscaling.

## External Dependencies

### Frontend
- **Radix UI**: Comprehensive component library for accessibility.
- **TanStack Query**: Server state synchronization.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

### Backend
- **Sharp**: High-performance image processing library.
- **Drizzle ORM**: Type-safe database queries.
- **JSZip**: JavaScript ZIP file creation/extraction.
- **Multer**: File upload middleware.

### Database
- **PostgreSQL**: Primary database.
- **Neon Database**: Serverless hosting for PostgreSQL.
- **Drizzle Kit**: Database migration and schema management.