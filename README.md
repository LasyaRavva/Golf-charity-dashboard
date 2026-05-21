# Golf Charity Platform

# Deployment Link: https://golf-charity-dashboard.vercel.app/

# Admin Credentials
# Mail: golfadmin@test.com
# Password: Admin1234

# User Credentials
# Mail: sarah@test.com
# Password: Test1234

Monorepo scaffold for a React + Vite frontend and a Node.js + Express backend.

## Apps

- `client`: React frontend using JavaScript and JSX.
- `server`: Express API scaffold with routes, controllers, middleware, and utility helpers.

## Run locally

### Client

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npm run dev
```

## Production Deployment

Recommended setup:

- Frontend: Vercel
- Backend: Render or Railway
- Database: Supabase
- Payments: Stripe

### 1. Prepare environment variables

Copy these files and fill in real values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Required backend variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `CLIENT_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MONTHLY_PRICE_ID`
- `YEARLY_PRICE_ID`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

Required frontend variables:

- `VITE_API_URL`

### 2. Deploy Supabase

Create a fresh Supabase project and configure:

- `users`
- `subscriptions`
- `scores`
- `draws`
- `draw_entries`
- `winners`
- `charities`
- `charity_events`
- `donations`
- `prize_pools`

Important fields used by the app:

- `users.charity_id`
- `users.charity_percentage`
- `subscriptions.user_id`
- `subscriptions.plan`
- `subscriptions.status`
- `scores.user_id`
- `draws.draw_numbers`
- `winners.proof_url`
- `donations.type`
- `donations.created_at`

### 3. Deploy backend

Deploy `server` as a Node service.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Set all backend environment variables in your hosting dashboard.

After deploy, confirm:

- `GET /` returns `{ "status": "ok" }`
- `POST /api/subscriptions/webhook` is publicly reachable by Stripe

### 4. Configure Stripe

In Stripe:

1. Create monthly and yearly recurring prices.
2. Put those IDs into `MONTHLY_PRICE_ID` and `YEARLY_PRICE_ID`.
3. Add a webhook endpoint pointing to:

```text
https://your-backend-domain/api/subscriptions/webhook
```

4. Subscribe the webhook to:

- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.deleted`

### 5. Deploy frontend

Deploy `client` to Vercel.

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

Set:

```bash
VITE_API_URL=https://your-backend-domain/api
```

### 6. Final production updates

- Set backend `CLIENT_URL` to the real Vercel frontend URL
- Enable HTTPS on both frontend and backend
- Rotate any secrets that were previously committed locally
- Re-test Stripe checkout after updating live URLs

### 7. Smoke test checklist

- User signup works and requires charity selection
- Login works
- Subscription checkout redirects to Stripe
- Stripe webhook activates subscription
- Score entry keeps only the latest 5 scores
- Admin can load draws list
- Admin can simulate and publish draws
- User can submit winner proof
- Admin can approve winners and mark payouts
- Charity totals increase after subscription payments
