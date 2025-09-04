# ConstructPro - Construction Project Management Platform

## Overview

ConstructPro is a comprehensive construction project management platform designed for managing construction projects, permits, budgets, vendors, and teams. The application provides role-based access control for different user types (admin, project manager, owner, vendor, viewer) and supports the complete construction project lifecycle from planning through completion.

The system is built as a full-stack TypeScript application with React frontend, Express.js backend, PostgreSQL database, and integrates with Google Cloud Storage for file management. It follows modern web development patterns with type-safe APIs, real-time data management, and comprehensive audit logging.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in a Vite-powered development environment
- **UI Components**: Radix UI primitives with shadcn/ui design system for consistent, accessible components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates and caching
- **Routing**: Wouter for lightweight client-side routing
- **File Uploads**: Uppy integration for robust file upload experiences with drag-and-drop and progress tracking

### Backend Architecture
- **Framework**: Express.js with TypeScript for type-safe server-side development
- **API Design**: RESTful API architecture with consistent error handling and response formats
- **Authentication**: Replit Auth integration with OpenID Connect for secure user authentication
- **Session Management**: PostgreSQL-backed session storage for scalable session handling
- **File Storage**: Google Cloud Storage integration with custom ACL (Access Control List) system for secure file management
- **Middleware**: Comprehensive logging, error handling, and authentication middleware

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting for scalability
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Design**: Comprehensive relational schema covering:
  - User management with role-based permissions
  - Property/project tracking with status workflows
  - Milestone and task management
  - Budget tracking and financial management
  - Vendor and RFQ (Request for Quote) management
  - Permit tracking and compliance
  - Risk and issue management
  - Document storage with metadata
  - Activity logging and audit trails

### Authentication and Authorization
- **Authentication Provider**: Replit Auth with OpenID Connect for secure, federated authentication
- **Session Management**: Server-side sessions stored in PostgreSQL for security and scalability
- **Role-Based Access Control**: Five-tier permission system (admin, pm, owner, vendor, viewer) with route-level protection
- **Object-Level Security**: Custom ACL system for fine-grained access control to files and documents

### External Dependencies
- **Database Hosting**: Neon PostgreSQL for serverless, auto-scaling database infrastructure
- **File Storage**: Google Cloud Storage for secure, scalable file storage with custom ACL policies
- **Authentication**: Replit Auth service for user authentication and identity management
- **Development Tools**: 
  - Vite for fast development builds and hot module replacement
  - Replit-specific plugins for development environment integration
  - ESBuild for production bundling and optimization

### Key Design Patterns
- **Type Safety**: End-to-end TypeScript with shared schemas between frontend and backend
- **API Layer**: Centralized API client with automatic error handling and authentication
- **Component Architecture**: Atomic design principles with reusable UI components
- **Data Validation**: Zod schemas for runtime type checking and validation
- **Audit Logging**: Comprehensive activity tracking for compliance and debugging
- **Error Handling**: Structured error responses with user-friendly messaging
- **Performance**: Query optimization with React Query caching and background refetching