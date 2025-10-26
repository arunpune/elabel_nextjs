# Wine Inventory System - AI Development Guide

## Core Architecture

```
client/src/          # React frontend (Vite)
  components/        # UI components & forms
  lib/              # Auth, queries, utils
  pages/            # Route components
server/             # Express backend
shared/             # Cross-stack types & config 
```

## Key Development Patterns

### Data Flow
1. Schema definitions in `shared/schema.ts` using Drizzle ORM
2. API endpoints in `server/routes.ts` validate against Zod schemas
3. React Query hooks in components fetch & cache data
4. Forms use shadcn/ui components with Zod validation

Example product creation flow:
```typescript
// 1. Schema (shared/schema.ts)
export const products = pgTable('products', {
  name: text('name').notNull(),
  brand: text('brand'),
  // ...
});

// 2. API (server/routes.ts)
app.post('/api/products', validateBody(insertProductSchema), async (req, res) => {
  // ...
});

// 3. UI (client/src/components/forms/ProductForm.tsx)
const form = useForm({
  resolver: zodResolver(insertProductSchema)
});
```

### Authentication & Authorization
- Supabase Auth handles sessions & JWT
- Protected routes wrap components in `ProtectedRoute.tsx`
- Server middleware validates JWT in `server/auth.ts`

### File Handling
- Images stored in `uploads/` via Multer (`server/routes.ts`)
- Excel imports processed by XLSX library
- File types validated on upload

## Common Tasks

### Adding New Features
1. Define types in `shared/schema.ts`
2. Add API endpoint in `server/routes.ts`
3. Create UI components in `client/src/components/`
4. Update navigation in `Navigation.tsx`

### Database Changes
```bash
# 1. Update schema in shared/schema.ts
# 2. Apply changes:
npm run db:push
```

### Testing
```bash
npm run test        # Run all tests
npm run test:ui     # Open Playwright UI
```
Key test files: `tests/login.spec.ts`, `tests/productspec.ts`

## Best Practices

### UI Components
- Use shadcn/ui components from `components/ui/`
- Follow form patterns from `components/forms/`
- Handle mobile views with `use-mobile` hook

### Error Handling
- API errors logged to Sentry
- Use toast notifications from `use-toast.ts`
- Validate all inputs with Zod schemas

### State Management
- Server state: React Query
- Form state: React Hook Form
- UI state: Local hooks

## Deployment

### Build Process
```bash
# 1. Frontend build (outputs to dist/public/)
NODE_ENV=production npx vite build

# 2. Backend build (outputs to dist/index.js)
NODE_ENV=production npx esbuild server/production.ts
```

### Docker Deployment
The project uses multi-stage builds to optimize the image:

1. **Builder Stage** (`Dockerfile`):
   - Installs build dependencies (Python, make, g++)
   - Builds frontend assets
   - Bundles backend with esbuild
   - Externalizes node_modules for smaller builds

2. **Production Stage**:
   - Uses slim Node.js image
   - Copies only necessary files
   - Configures environment variables

### Environment Setup
Required variables for deployment:
```bash
DATABASE_URL=          # Supabase PostgreSQL connection
SUPABASE_URL=         # Supabase project URL
SUPABASE_ANON_KEY=    # Public anon key
NODE_ENV=production   # Must be set for optimized builds
PORT=                 # Optional (defaults to 5000)
```

### Production Server
- Express serves static files from `dist/public/`
- Client-side routing handled via fallback to `index.html`
- API routes prefixed with `/api`
- Uploads directory must be persistent volume