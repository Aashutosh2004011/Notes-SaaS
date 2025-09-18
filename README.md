# Multi-Tenant SaaS Notes Application

A secure, multi-tenant notes application built with Next.js, MongoDB, and Prisma.

## Features

- Multi-tenancy with data isolation
- JWT-based authentication
- Role-based access control (Admin/Member)
- Subscription plans (Free/Pro) with feature gating
- CRUD operations for notes
- Responsive UI with Tailwind CSS

## Multi-Tenancy Approach

This application uses a **shared schema with tenant ID column** approach. All tenant-specific data includes a `tenantId` field that ensures data isolation. This approach was chosen because:

1. It's cost-effective for MongoDB (single database)
2. Simplifies database management and migrations
3. Provides good performance with proper indexing
4. Allows for easy scaling within MongoDB's limits

All database queries include a `tenantId` filter to ensure strict data isolation between tenants.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Vercel account (for deployment)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:
DATABASE_URL="mongodb+srv://01kingrajput01_db_user:hellohello@kanchimine10.camlpgo.mongodb.net/?retryWrites=true&w=majority&appName=KanchiMine10"
JWT_SECRET="helloitsmeaashutoshsingh"
4. Set up database: `npx prisma db push`
5. Seed the database: `npm run seed`
6. Run the development server: `npm run dev`

### Test Accounts

The following test accounts are available (all with password: `password`):

- Admin: `admin@acme.test` (Acme Inc.)
- User: `user@acme.test` (Acme Inc.)
- Admin: `admin@globex.test` (Globex Corporation)
- User: `user@globex.test` (Globex Corporation)

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro plan (Admin only)

## Deployment

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The application will automatically build and deploy. Database migrations need to be run manually after deployment.

## Security Features

- JWT authentication with secure HTTP-only cookies
- Role-based access control
- Tenant data isolation at the application level
- Input validation and error handling
- CORS enabled for API endpoints

## License

MIT