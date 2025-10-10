# Bale Inventory - Fabric Management System

A comprehensive inventory management system for fabric traders built with Next.js and Supabase.

## Features

- **Multi-tenant Architecture** - Company-based isolation with RLS
- **Product Catalog** - Manage fabric specifications, colors, materials
- **Inventory Management** - Track stock units with QR codes
- **Sales Orders** - Complete order management and fulfillment
- **Job Works** - Outsourced work tracking (dyeing, printing, etc.)
- **Partners** - Manage customers, suppliers, vendors, agents
- **Goods Movement** - Dispatch and receipt tracking
- **Barcode System** - QR code generation for stock tracking
- **Public Catalog** - Customer-facing product catalog

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with JWT

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase CLI

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/CHIBOLAR/Bale3.git
cd "Bale Inventorye"
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Start Supabase locally
\`\`\`bash
supabase start
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Database

The database schema includes:
- Companies & Users (multi-tenant foundation)
- Warehouses
- Products & Stock Units
- Sales Orders & Items
- Job Works (raw materials & finished goods)
- Partners (customers, suppliers, vendors, agents)
- Goods Dispatch & Receipt
- Barcode Management
- Catalog Configuration

All migrations are in `supabase/migrations/`.

## Development

### Supabase Studio
Access the local Supabase Studio at [http://127.0.0.1:54323](http://127.0.0.1:54323)

### Database Migrations
\`\`\`bash
# Create new migration
supabase migration new feature_name

# Apply migrations
supabase db reset
\`\`\`

### Environment Variables
Copy `.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Project Structure

\`\`\`
bale-inventory/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Utilities and configs
│   └── supabase/       # Supabase clients
├── supabase/
│   └── migrations/     # Database migrations (16 files)
└── types/              # TypeScript types
\`\`\`

## Security

- Row Level Security (RLS) policies on all tables
- Multi-tenant isolation by `company_id`
- Role-based access (Admin/Staff)
- Warehouse-level restrictions for Staff users

## License

MIT License - see [LICENSE](LICENSE)

## Contributing

This is a private project. For issues or suggestions, contact the team.

---

Built with [Claude Code](https://claude.com/claude-code)
