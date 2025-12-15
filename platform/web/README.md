# Strix Platform Web Dashboard

A modern Next.js 14 + TypeScript dashboard for the Strix AI-powered security testing platform.

## Features

### 🔐 Authentication & Authorization
- **Clerk Integration**: Complete authentication system with sign-in/sign-up flows
- **Protected Routes**: Middleware-secured dashboard access
- **Session Management**: Automatic token forwarding to backend API

### 📊 Dashboard Overview
- **Active Scans**: Real-time monitoring of running security scans
- **Severity Charts**: Visual distribution of findings (Pie & Bar charts)
- **Statistics Cards**: Key metrics at a glance
- **Recent Activity**: Latest scans and findings

### 🎯 Project Management
- **Project Creation**: Easy project setup with forms and validation
- **Target Management**: Add/manage web applications, APIs, and codebases
- **Scan History**: Track all security assessments per project

### 🔍 Scan Monitoring
- **Live Status**: Real-time scan progress tracking
- **Findings Tables**: Split view for Strix AI vs Nuclei findings
- **Validation Tools**: Mark findings as validated/invalidated
- **Artifact Links**: Access to screenshots, logs, and proof-of-concepts

### 📋 Report Generation
- **Multiple Formats**: PDF, HTML, and JSON report exports
- **Preview Mode**: In-app report preview
- **Download Management**: Easy report sharing and downloads

### ⏰ Scheduling System
- **Cron Helper**: Visual cron expression builder
- **Flexible Scheduling**: Daily, weekly, monthly, or one-time scans
- **Time Zone Support**: Proper scheduling with time management

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom component library with Radix UI primitives
- **State Management**: TanStack Query (React Query) with optimistic updates
- **Authentication**: Clerk for user management
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Notifications**: React Hot Toast
- **Testing**: Vitest + Testing Library + Playwright E2E

## Project Structure

```
platform/web/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard overview page
│   ├── projects/          # Project management pages
│   ├── scans/            # Scan detail pages
│   ├── reports/          # Report preview/download
│   └── sign-in/          # Authentication pages
├── components/
│   ├── ui/               # Reusable UI components
│   └── common/           # Domain-specific components
├── hooks/                # Custom React hooks for API
├── lib/                  # Utility libraries
├── tests/                # Test files
│   ├── e2e/             # Playwright E2E tests
│   └── components/      # Component unit tests
└── types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager
- Clerk account for authentication
- Backend API (FastAPI) running on port 8000

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd platform/web
   pnpm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update the following variables:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

3. **Start Development Server**:
   ```bash
   pnpm dev
   ```

4. **Run Tests**:
   ```bash
   # Unit tests
   pnpm test
   
   # E2E tests
   pnpm test:e2e
   ```

## API Integration

The dashboard integrates with a FastAPI backend that should provide the following endpoints:

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Targets
- `GET /api/projects/{project_id}/targets` - List project targets
- `POST /api/projects/{project_id}/targets` - Add target to project
- `GET /api/targets/{id}` - Get target details
- `PUT /api/targets/{id}` - Update target
- `DELETE /api/targets/{id}` - Delete target

### Scans
- `GET /api/projects/{project_id}/scans` - List project scans
- `POST /api/scans` - Start new scan
- `GET /api/scans/{id}` - Get scan details
- `PUT /api/scans/{id}` - Update scan status

### Findings
- `GET /api/scans/{scan_id}/findings` - List scan findings
- `PUT /api/findings/{id}` - Update finding validation status

### Reports
- `GET /api/scans/{scan_id}/reports` - List generated reports
- `POST /api/scans/{scan_id}/reports` - Generate new report
- `GET /api/reports/{id}/download` - Download report file

## Key Features Implementation

### Authentication Flow
- Clerk handles all authentication
- Middleware protects dashboard routes
- Tokens automatically forwarded to API calls
- Sign-in/sign-up pages with Clerk components

### Real-time Updates
- TanStack Query with polling for live scan status
- Optimistic updates for immediate UI feedback
- Error handling with toast notifications

### Data Visualization
- Recharts for severity distribution charts
- Responsive design for all screen sizes
- Interactive tooltips and legends

### Form Management
- React Hook Form for performance
- Zod schema validation
- Error handling and user feedback

### Testing Strategy
- **Unit Tests**: Component testing with Vitest + Testing Library
- **E2E Tests**: Full user flows with Playwright
- **Mock Data**: Comprehensive API mocking for tests

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Conventional commits for git

### Component Design
- Atomic design principles
- Shared UI component library
- Domain-specific business components

### State Management
- TanStack Query for server state
- React hooks for local state
- Optimistic updates for better UX

### Performance
- Next.js App Router for optimal routing
- Image optimization
- Code splitting and lazy loading
- React Query caching

## Deployment

### Build for Production
```bash
pnpm build
pnpm start
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_API_BASE_URL=https://api.strix.com
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation for API changes
4. Use semantic commit messages

## Security Considerations

- All API calls include authentication tokens
- Sensitive data never stored in localStorage
- HTTPS required in production
- Input validation on all forms
- XSS protection with Next.js built-in features