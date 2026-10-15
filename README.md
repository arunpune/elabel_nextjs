# Wine Label Management System (Open E-Label)

A full-stack web application for wine producers to manage wine inventory, generate EU-compliant Digital Product Passports (DPP), render and print standardized bottle labels with QR codes, and track supply chain traceability.

## Features

- **Product Management**: Create, edit, duplicate, and delete wine products with detailed oenological, nutritional, and logistical data.
- **EU-Compliant Wine Labels (SVG)**: Generates standard 100 × 120 mm back labels for 750 ml bottles containing legally required particulars, warning pictograms, and embedded QR codes.
- **Direct Label Printing**: Direct one-click printing of SVG bottle labels at exact physical dimensions (100 × 120 mm) using an invisible browser frame without pop-ups.
- **Digital Product Passport (DPP)**: Unauthenticated, mobile-optimized public passport webpage (`/qr/product/:id`, `/dpp/:id`, `/p/:id`) displaying full ingredients, allergens, nutrition, and certifications upon scanning.
- **Permanent QR Code Addresses**: Permanent QR URLs stored in PostgreSQL (`products.qr_url`), preserving origin addresses and ensuring printed physical labels never break.
- **Ingredient & Allergen Tracking**: Reusable ingredient library with E-numbers, custom label ordering (`ingredient_ids`), and automatic bold styling for allergens in compliance with EU 1169/2011 art. 21.
- **Intelligent Geolocation**: Automatic facility location capture via HTML5 GPS, fallback IP estimation (`ipwho.is` / `ipapi.co`), OpenStreetMap Nominatim geocoding, and Google Maps integration.
- **QR Scan Analytics**: Optional shopper scan geolocation capture with in-memory rate limiting and GeoJSON spatial export (`/api/scans.geojson`) for GIS and QGIS mapping.
- **Excel Bulk Import/Export**: Bulk import and export for both wine products and ingredients via Excel (`.xlsx`) and CSV spreadsheets.
- **Image Management**: Bottle photo uploads with fallback to local persistent disk volumes (`/uploads`) or Vercel Blob cloud storage.
- **Authentication & Security**: Supabase Auth (Email & Password) with password visibility toggle, automated session token refreshing, and owner-level record authorization.
- **Error Monitoring**: Real-time error and exception tracking via Sentry on both frontend (React) and backend (Express/Node.js).

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI / shadcn/ui, Lucide Icons, React Hook Form, Zod, TanStack React Query, Wouter
- **Backend**: Node.js (v20+), Express.js, Drizzle ORM, postgres.js, Multer
- **Database**: Supabase PostgreSQL (Session Pooler)
- **Authentication**: Supabase Auth
- **Label & QR Generation**: `qrcode`, Standalone SVG generation, Browser Print API
- **Geolocation**: HTML5 Geolocation API, OpenStreetMap Nominatim, IPWho.is / IPAPI
- **File & Spreadsheet Processing**: Multer, XLSX
- **Monitoring**: Sentry (`@sentry/react`, `@sentry/node`)
- **Containerization & Hosting**: Docker, Docker Compose, Render

## Local Setup

### Prerequisites

- Node.js (v20 or higher) and npm
- Docker and Docker Desktop (optional, for containerized execution)
- Supabase account (for PostgreSQL database and authentication)
- Sentry account (optional, for exception monitoring)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd elabel_nextjs
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your project credentials:

   ```env
   # Database (Supabase Session Pooler - IPv4 compatible)
   DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres

   # Backend Authentication & Security
   JWT_SECRET=your-secure-jwt-secret-key
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-app-password

   # Public Base URL (QR codes and DPP links resolve to this host)
   BASE_URL=http://localhost:5000

   # Supabase Configuration
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_ANON_KEY=your_supabase_public_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key

   # Frontend Build Variables (baked in at build time)
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_public_anon_key

   # Runtime Settings
   NODE_ENV=development
   PORT=5000
   HOST=0.0.0.0

   # Error Monitoring (Optional)
   VITE_SENTRY_DSN=https://your-public-key@your-org.ingest.sentry.io/project-id
   SENTRY_AUTH_TOKEN=your_sentry_auth_token

   # Storage & Analytics (Optional)
   BLOB_READ_WRITE_TOKEN=
   SCANS_EXPORT_KEY=your-secret-scans-export-key
   ```

   > [!IMPORTANT]
   > For `DATABASE_URL`, always use the **Session Pooler** connection string (`pooler.supabase.com:5432`). Direct Supabase hostnames (`db.<ref>.supabase.co`) resolve exclusively to IPv6 addresses, which fail inside Docker and non-IPv6 local networks.

4. **Database Migration**

   The server automatically checks and applies database migrations from `server/db/*.sql` on launch (`server/migrate.ts`). To manually push schema changes via Drizzle:

   ```bash
   npm run db:push
   ```

5. **Start the Development Server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`.

### Docker Setup

To run the full stack inside an isolated, production-grade Docker container:

1. Ensure `.env` is configured (including `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
2. Build and launch the container in detached mode:

   ```bash
   docker compose up -d --build
   ```

3. Check container health:

   ```bash
   curl http://localhost:5000/api/health
   # {"status":"ok"}
   ```

4. View logs or stop the service:

   ```bash
   docker compose logs -f app
   docker compose down
   ```

## Development Commands

- `npm run dev` - Start development server with Vite hot-reload on port 5000
- `npm run build` - Build the React client with Vite and bundle Express with esbuild
- `npm start` - Run the production server from `dist/index.js`
- `npm run check` - Run TypeScript compiler (`tsc`) type checking
- `npm run db:push` - Push `shared/schema.ts` schema changes directly to Supabase
- `npm run lint` - Run ESLint code quality checks
- `npm run format` - Format codebase with Prettier
- `npm run check:storage` - Verify database storage operations against test database
- `npm run check:migrate` - Validate startup migration SQL files against test database

## Project Structure

```
elabel_nextjs/
├── client/                         # Frontend React SPA
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── forms/              # ProductForm, IngredientForm, IngredientPicker
│   │   │   ├── label/              # WineLabel SVG renderer, QR generator, print logic
│   │   │   ├── layout/             # Navigation, ProtectedRoute, Page layout
│   │   │   ├── modals/             # ProductPreviewModal, DeleteConfirmationModal
│   │   │   ├── tables/             # ProductsTable, IngredientsTable
│   │   │   └── ui/                 # Base shadcn / Radix UI primitives
│   │   ├── hooks/                  # Custom React hooks (use-toast, etc.)
│   │   ├── lib/                    # Supabase client, API client, geolocation helpers
│   │   ├── pages/                  # Route views (Products, Detail, Ingredients, Passport, Auth)
│   │   ├── types/                  # TypeScript interface definitions
│   │   ├── App.tsx                 # Wouter route definitions and layout shell
│   │   ├── index.css               # Design system tokens and Tailwind layers
│   │   └── main.tsx                # Client bootstrap with React Query and Sentry
│   └── index.html                  # HTML entry point
├── server/                         # Backend Express application
│   ├── db/                         # SQL migration files
│   ├── auth.ts                     # User identity helpers and session validation
│   ├── db.ts                       # PostgreSQL connection pooling setup
│   ├── index.ts                    # Development server bootstrap with Vite HMR
│   ├── migrate.ts                  # Automatic startup SQL migration runner
│   ├── production.ts               # Production HTTP server with Sentry error logging
│   ├── routes.ts                   # REST API routes and business logic
│   ├── storage.ts                  # Drizzle ORM data persistence layer
│   └── vite.ts                     # Development Vite middleware integration
├── shared/                         # Shared full-stack definitions
│   ├── publicUrl.ts                # QR URL resolution and base address helpers
│   ├── schema.ts                   # Drizzle schema definitions and Zod validation
│   └── supabase.ts                 # Shared Supabase connection config
├── scripts/                        # Development and validation scripts
│   ├── dev.mjs                     # Development server runner
│   ├── check-migrate.ts            # Migration integrity verification
│   └── check-storage.ts            # Data access layer smoke test
├── uploads/                        # Persistent local directory for uploaded bottle images
├── Dockerfile                      # Multi-stage optimized production Docker image
├── docker-compose.yml              # Docker Compose service definition
├── drizzle.config.ts               # Drizzle ORM configuration
├── tailwind.config.ts              # Tailwind CSS theme configuration
└── vite.config.ts                  # Vite build and plugin configuration
```

## API Endpoints

### System & Configuration

- `GET /api/health` - Service health status check
- `GET /api/config` - Public frontend configuration (`supabaseUrl`, `supabaseAnonKey`, `publicUrl`)

### Public & Digital Product Passport (DPP)

- `GET /api/public/products/:id` - Fetch public product passport with ordered ingredients (unauthenticated)
- `POST /api/public/scans` - Log an unauthenticated shopper QR scan location (`{productId, lat, lng, source}`)
- `GET /api/scans.geojson` - Export scan coordinates as GeoJSON (requires `SCANS_EXPORT_KEY` query param)

### Geolocation & Traceability

- `GET /api/geolocation/detect` - Server-side IP geolocation detection
- `GET /api/geolocation/reverse?lat=&lon=` - Reverse geocode GPS coordinates to street address
- `GET /api/geolocation/search?q=` - Search coordinates from text address via Nominatim

### Products (🔒 Requires Authentication)

- `GET /api/products` - List all products with user edit permissions
- `GET /api/products/:id` - Get single product details and ingredients
- `POST /api/products` - Create new wine product (generates permanent QR URL)
- `PUT /api/products/:id` - Update existing product (owner only)
- `DELETE /api/products/:id` - Delete product and clean up attached image (owner only)
- `POST /api/products/:id/image` - Upload and link product bottle image
- `DELETE /api/products/:id/image` - Delete product image from storage
- `POST /api/get-url` - Direct upload handler for product imagery
- `GET /api/products/export` - Export all products to Excel spreadsheet
- `POST /api/products/import` - Bulk import products from Excel (`.xlsx`) or CSV

### Ingredients (🔒 Requires Authentication)

- `GET /api/ingredients` - List all user ingredients
- `GET /api/ingredients/:id` - Get single ingredient details
- `POST /api/ingredients` - Create new ingredient with allergen tags
- `PUT /api/ingredients/:id` - Update ingredient details
- `DELETE /api/ingredients/:id` - Delete ingredient
- `GET /api/ingredients/export` - Export ingredients to Excel spreadsheet
- `POST /api/ingredients/import` - Bulk import ingredients from Excel (`.xlsx`) or CSV

## Database Schema

### Products Table (`products`)

- `id` - Primary key (serial integer)
- `name` - Wine / product commercial name (text, required)
- `brand` - Producer brand or label line (text)
- `netVolume` - Net bottle volume, e.g. "750 ml" (text)
- `vintage` - Harvest year, e.g. "2021" (text)
- `wineType` - Category, e.g. "Dry Red Wine", "Sparkling" (text)
- `sugarContent` - Sugar profile, e.g. "Dry", "Brut", "Demi-Sec" (text)
- `appellation` - Protected geographical indication / region (text)
- `alcoholContent` - Alcohol by volume percentage, e.g. "13.5%" (text)
- `packagingGases` - Preservative gases, e.g. "bottled", "may_happen" (text)
- `portionSize` - Reference serving size, e.g. "100 ml" (text)
- `kcal` - Energy in kilocalories per 100 ml (text)
- `kj` - Energy in kilojoules per 100 ml (text)
- `fat` - Total fat in grams per 100 ml (text)
- `saturates` - Saturated fatty acids in grams per 100 ml (text)
- `carbohydrates` - Carbohydrates in grams per 100 ml (text)
- `sugar` - Sugars in grams per 100 ml (text)
- `protein` - Protein in grams per 100 ml (text)
- `salt` - Salt in grams per 100 ml (text)
- `pregnancyWarning` - Health warning: not for pregnant women (boolean)
- `ageWarning` - Legal drinking age restriction warning (boolean)
- `drivingWarning` - Health warning: do not drink and drive (boolean)
- `organic` - Organic wine certification status (boolean)
- `vegetarian` - Vegetarian certification status (boolean)
- `vegan` - Vegan certification status (boolean)
- `operatorType` - Business role: Bottler, Producer, Packager, Importer, Vendor (text)
- `operatorName` - Legal company / producer name (text)
- `operatorAddress` - Registered facility address (text)
- `operatorInfo` - Supplementary operator details (text)
- `countryOfOrigin` - Country where the wine was produced (text)
- `manufacturingLocation` - Facility / vineyard name (text)
- `manufacturingAddress` - Facility physical street address (text)
- `manufacturingCity` - Facility municipality / city (text)
- `manufacturingState` - Facility state, province, or region (text)
- `manufacturingCountry` - Facility country (text)
- `manufacturingPostalCode` - Facility ZIP / postal code (text)
- `manufacturingLatitude` / `latitude` - GPS latitude coordinate (text)
- `manufacturingLongitude` / `longitude` - GPS longitude coordinate (text)
- `sku` - Stock Keeping Unit code (text)
- `ean` - European Article Number barcode string (text)
- `externalLink` - External winery or marketing website (text)
- `redirectLink` - Forwarding URL overriding default public passport (text)
- `imageUrl` - Filepath or URL of uploaded bottle photograph (text)
- `qrUrl` - Permanent generated Digital Product Passport QR address (text)
- `ingredientIds` - Array of ingredient IDs in the exact order shown on the label (integer[])
- `createdAt` - Record creation timestamp (timestamp)
- `updatedAt` - Record last modification timestamp (timestamp)
- `createdBy` - Legacy integer user ID reference (integer)
- `ownerId` - Supabase authentication user UUID (uuid)

### Ingredients Table (`ingredients`)

- `id` - Primary key (serial integer)
- `name` - Ingredient designation, e.g. "Grapes", "Sulphites" (text, required)
- `category` - Functional class, e.g. "Base", "Preservative", "Acidity regulator" (text)
- `eNumber` - European additive identifier code, e.g. "E220" (text)
- `allergens` - Recognized allergen classifications (text[])
- `details` - Additional technical notes or processing information (text)
- `createdAt` - Record creation timestamp (timestamp)
- `updatedAt` - Record last modification timestamp (timestamp)
- `createdBy` - Legacy integer user ID reference (integer)
- `ownerId` - Supabase authentication user UUID (uuid)

### Scans Table (`scans`)

- `id` - Primary key (serial integer)
- `productId` - Foreign key linking to scanned product (integer)
- `lat` - Shopper latitude coordinate (double precision)
- `lng` - Shopper longitude coordinate (double precision)
- `source` - Client device or scanner source identifier (text)
- `createdAt` - Timestamp when the QR scan was recorded (timestamp)

### Users Table (`users`)

- `id` - Primary key (serial integer)
- `username` - Unique user handle (varchar)
- `email` - Unique email address (varchar)
- `password` - Hashed password string (varchar)
- `isEmailConfirmed` - Email verification status (boolean)
- `emailConfirmationToken` - Email verification token (varchar)
- `emailConfirmationTokenExpiry` - Token expiration timestamp (timestamp)
- `createdAt` - Account registration timestamp (timestamp)

## Import/Export Format

### Products Excel Format

When importing products via Excel (`.xlsx`) or CSV, the parser maps the following columns:

| Column Header | Accepted Aliases | Description | Example |
|---|---|---|---|
| `Name` | `Product Name` | Product title (Required) | Chateau Lumière Reserve |
| `Net Volume` | `Volume` | Bottle volume | 750 ml |
| `Vintage` | `Year` | Harvest year | 2021 |
| `Wine Type` | `Type`, `Wine Category` | Beverage classification | Dry Red Wine |
| `Sugar Content` | `Sugar` | Residual sugar category | Dry |
| `Appellation` | `Region` | Protected origin / appellation | Bordeaux AOP |
| `SKU` | `Product Code` | Internal stock keeping unit | CLR-2021-01 |

Exported product files contain the full set of particulars including Name, Volume, Vintage, Wine Type, Sugar Content, Appellation, SKU, and all manufacturing location address and GPS coordinates.

### Ingredients Excel Format

When importing ingredients via Excel (`.xlsx`) or CSV, the spreadsheet must include:

| Column Header | Description | Example |
|---|---|---|
| `Name` | Ingredient chemical or common name (Required) | Potassium metabisulphite |
| `Category` | Additive or processing classification | Preservatives |
| `E Number` | European food additive code | E224 |
| `Allergens` | Comma-separated allergen triggers | Sulphites |
| `Details` | Supplementary specifications | Antioxidant agent |

## Deployment

### Render (Live Deployment)

The live application is hosted on Render as a Node Web Service connected to GitHub repository `om-bagade2007/elabel_nextjs`.

1. **Service Configuration**:
   - **Environment**: Node
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
2. **Environment Variables**:
   - Add `DATABASE_URL` (Supabase Session Pooler string).
   - Add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`.
   - Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
   - Set `BASE_URL=https://wine-label-management-system.onrender.com`.
   - Optional: `VITE_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SCANS_EXPORT_KEY`.
3. **Database Migrations**:
   - Handled automatically on startup by `server/migrate.ts`.

### Docker (Self-Hosted)

The application includes a production-ready multi-stage `Dockerfile` and `docker-compose.yml`:

```bash
# 1. Prepare environment variables
cp .env.example .env

# 2. Build and run container
docker compose up -d --build

# 3. View running container logs
docker compose logs -f app
```

- Multi-stage build compiles Vite and esbuild assets before pruning development dependencies.
- Runs securely under the unprivileged `node` user.
- Local uploads persist across container restarts via the `uploads` Docker volume.
- Integrated container health check queries `/api/health` every 30 seconds.

### Sentry (Error Monitoring)

The project includes Sentry integration for real-time error tracking across both the frontend React client and backend Express server.

1. **Obtain Sentry DSN**:
   - Create a project on [sentry.io](https://sentry.io) and copy the **DSN** from *Project Settings → Client Keys (DSN)*.
2. **Configure Environment Variables**:
   - Set `VITE_SENTRY_DSN=<your-dsn>` in `.env` (or under Render's *Environment* / Docker build args).
   - *(Optional for readable stack traces)*: Create an auth token in Sentry (*User Settings → Auth Tokens* with scope `project:releases`) and set `SENTRY_AUTH_TOKEN=<your-token>`.
3. **Verify Error Tracking**:
   - Open the web application and run the following in your browser's developer console (F12):
     ```javascript
     setTimeout(() => { throw new Error('Sentry test event'); });
     ```
   - Verify that the error appears within a minute under **Issues** in your Sentry dashboard.

## Troubleshooting

| Problem | Root Cause | Solution |
|---|---|---|
| `getaddrinfo ENOTFOUND db.<ref>.supabase.co` | Direct Supabase database hostnames resolve exclusively via IPv6, which is unsupported by Docker networks. | In `.env`, use the Supabase **Session Pooler** connection string (`aws-0-<region>.pooler.supabase.com:5432`). |
| Blank white screen on Docker or Render | `VITE_*` environment variables were not present during the Vite frontend build step. | Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before running `npm run build` or pass them as Docker build args. |
| Button or input styling looks disabled | Overridden background utility classes (e.g. `bg-accent`) causing text and button backgrounds to blend. | Use standard `<Button>` variants without conflicting background utility overrides. |
| Geolocation coordinates stay empty | Browser location permission was denied or ignored by user. | The system automatically falls back to IP address estimation. Alternatively, use the **Find coordinates** address search button or enter coordinates manually. |
| Render build fails with missing dev modules | Production build commands without devDependencies cannot run Vite or esbuild. | Ensure Render build command is set to `npm install --include=dev && npm run build`. |

## Contributing

1. Fork the repository
2. Create a descriptive feature branch (`git checkout -b feat/your-feature-name`)
3. Commit your changes (`git commit -m "feat: add feature description"`)
4. Verify TypeScript and code quality (`npm run check`)
5. Push to your branch and submit a Pull Request into `main`

## License

This project is licensed under the MIT License.
