# Bale Inventory - Hostinger Deployment Guide

## Prerequisites
- Hostinger VPS or Business hosting plan (supports Node.js)
- Supabase account (free tier works)

## Step 1: Set Up Production Supabase Project

1. Go to https://supabase.com/dashboard
2. Create a new project (or use existing)
3. Go to Project Settings > API
4. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

## Step 2: Apply Database Migrations to Production

```bash
# Install Supabase CLI if not already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to production
supabase db push
```

Or manually:
1. Go to SQL Editor in Supabase Dashboard
2. Run each migration file from `supabase/migrations/` in order

## Step 3: Update Environment Variables

Create `.env.production` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

## Step 4: Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test production build locally
npm start
```

## Step 5: Deploy to Hostinger

### Option A: Via SSH (Recommended)

1. SSH into your Hostinger server
2. Install Node.js (if not installed):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Upload your project:
```bash
# On your local machine
git push origin main

# On Hostinger server
cd /home/your-username/
git clone https://github.com/CHIBOLAR/Bale3.git
cd Bale3
```

4. Install and build:
```bash
npm install
npm run build
```

5. Set up environment variables:
```bash
nano .env.production
# Paste your production env variables
```

6. Run with PM2 (process manager):
```bash
npm install -g pm2
pm2 start npm --name "bale-inventory" -- start
pm2 save
pm2 startup
```

### Option B: Via Hostinger File Manager

1. Build locally:
```bash
npm run build
```

2. Upload these folders/files via File Manager:
   - `.next/` folder
   - `node_modules/` folder (or run `npm install` on server)
   - `public/` folder
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`
   - `.env.production`

3. Set up Node.js app in Hostinger control panel:
   - Application URL: your-domain.com
   - Application startup file: node_modules/next/dist/bin/next
   - Arguments: start
   - Environment: production

## Step 6: Configure Domain

1. In Hostinger control panel, point your domain to the Node.js app
2. Enable SSL certificate (free Let's Encrypt)

## Step 7: Supabase Production Configuration

1. In Supabase Dashboard > Authentication > URL Configuration:
   - Site URL: https://your-domain.com
   - Redirect URLs: https://your-domain.com/auth/callback

2. Enable email authentication or configure other providers

## Testing Production

1. Visit https://your-domain.com
2. Test signup flow
3. Test login
4. Verify database connections

## Maintenance

### Update application:
```bash
cd /home/your-username/Bale3
git pull origin main
npm install
npm run build
pm2 restart bale-inventory
```

### View logs:
```bash
pm2 logs bale-inventory
```

### Check status:
```bash
pm2 status
```

## Troubleshooting

### Port already in use:
```bash
pm2 delete bale-inventory
pm2 start npm --name "bale-inventory" -- start
```

### Build errors:
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Database connection issues:
- Verify Supabase URL and keys in `.env.production`
- Check Supabase project is active
- Verify RLS policies are not blocking queries

## Environment Variables Checklist

Production `.env.production`:
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY

## Performance Optimization

1. Enable Hostinger CDN
2. Configure caching headers
3. Optimize images in `next.config.ts`
4. Monitor with Supabase dashboard

---

Need help? Check:
- Hostinger Knowledge Base
- Supabase Documentation
- Next.js Deployment Docs
