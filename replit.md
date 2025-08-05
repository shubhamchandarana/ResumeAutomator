# Smart Recruiter Application

## Overview

This is a full-stack web application that automates resume screening and interview scheduling for HR teams using AI. The system provides an intelligent recruitment platform with automated resume parsing, AI-powered candidate matching, and streamlined interview workflow management.

The application features a modern React frontend with shadcn/ui components and a Node.js/Express backend that integrates with Google's Gemini AI for resume analysis and candidate evaluation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA (Single Page Application) mode
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints with JSON responses
- **File Handling**: Multer middleware for resume upload processing
- **Session Management**: Express sessions with PostgreSQL store
- **Error Handling**: Centralized error middleware with structured responses

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Structure**:
  - `users` - Admin user management
  - `jobs` - Job posting and requirements
  - `candidates` - Candidate profiles and resume data
  - `applications` - Application tracking with AI analysis results
- **Migration System**: Drizzle Kit for schema migrations

### AI Integration
- **AI Provider**: Google Gemini API for resume analysis
- **Analysis Features**:
  - Resume-to-job matching with 0-100 scoring
  - Strength and weakness identification
  - Interview question generation
  - Candidate summary creation
- **Prompt Engineering**: Structured prompts with JSON schema validation

### File Processing
- **Upload Handling**: Support for PDF and Word document formats
- **Storage**: Local file system with configurable upload directory
- **Parsing**: Resume text extraction from uploaded documents
- **Validation**: File type and size restrictions for security

### Email System
- **Provider**: SendGrid for transactional emails
- **Email Types**:
  - Interview invitation emails with scheduling details
  - Rejection notifications for unsuccessful candidates
  - HTML template-based email formatting

### Authentication & Authorization
- **Session-based Authentication**: Express sessions with secure cookie handling
- **Role-based Access**: Admin and candidate role separation
- **Security**: CSRF protection and secure session configuration

### Development Workflow
- **Development Server**: Vite dev server with HMR (Hot Module Replacement)
- **Build Process**: Separate client and server build pipelines
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Organization**: Monorepo structure with shared schema definitions

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL serverless database hosting
- **Google Gemini API**: AI-powered resume analysis and candidate evaluation
- **SendGrid**: Email delivery service for automated notifications

### Key Libraries
- **Frontend**: React, TanStack Query, Wouter, shadcn/ui, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Multer, Connect-PG-Simple
- **AI Integration**: @google/genai SDK
- **Development**: Vite, TypeScript, ESBuild

### Optional Integrations
- **Calendar Systems**: Designed for future Google Calendar or Calendly integration
- **Resume Parsing**: Extensible for pdf-parse or python-docx integration
- **Cloud Storage**: Architecture supports migration to cloud file storage