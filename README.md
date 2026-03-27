# Bill Receipt

> Simple invoicing for modern businesses.

**Bill Receipt** is a full-stack invoice management web app built for freelancers, consultants, and small business owners who need a clean, fast way to create and send professional invoices — without the bloat of enterprise billing software. It handles everything from client management and live invoice calculations to one-click PDF export, all backed by Firebase so your data is always in sync across devices. The app is fully responsive, works on mobile and desktop, and ships with Google Sign-In, automatic overdue detection, a revenue chart, invoice duplication, and a per-invoice activity log.

![Bill Receipt Dashboard](./public/screenshots/Bill%20receipt1.PNG)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 |
| Styling | Tailwind CSS |
| Auth | Firebase Authentication (Email/Password + Google) |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| Forms | React Hook Form + Zod |
| PDF | @react-pdf/renderer |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Dates | date-fns |

**Brand colors:** `#029aff` (blue) · `#020202` (near-black) · `#0E9F6E` (green/paid)

---

## Features

- Email/Password and Google Sign-In with password reset
- Client management — add, edit, delete with invoice-link protection
- Invoice creation with live totals (subtotal → discount → tax → grand total)
- Auto-generated invoice numbers: `BR-YYYY-XXXX`
- Multi-currency support: USD, EUR, GBP, NGN
- One-click PDF export branded with your business profile
- Invoice duplication — clone any invoice as a new draft instantly
- Automatic overdue detection on dashboard load
- Revenue chart — 6-month bar chart of paid invoices
- Per-invoice activity log — every status change timestamped
- Business profile settings (name, email, phone, address, tax ID)
- Keyboard shortcuts: `D` dashboard · `N` new invoice · `C` clients · `S` settings
- Fully responsive — permanent sidebar on desktop, hamburger drawer on mobile

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/bill-receipt.git
cd bill-receipt
npm install
```

### 2. Configure Firebase

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> Get these from Firebase Console → Project Settings → Your apps → Web app config.

### 3. Enable Firebase services

In the Firebase Console for your project:
- **Authentication** → Sign-in method → Enable **Email/Password** and **Google**
- **Firestore Database** → Create database → Production mode
- **Storage** → Get started

### 4. Deploy Firestore security rules

```bash
firebase deploy --only firestore:rules
```

Or paste `firestore.rules` into Firebase Console → Firestore → Rules tab.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked for build settings:
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

### Option B — Vercel Dashboard (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Vercel auto-detects Vite — no build config needed
5. Add your environment variables under **Settings → Environment Variables**:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

6. Click **Deploy**

> The `vercel.json` in this repo configures SPA routing so direct URL access (e.g. `/invoices/123`) works correctly.

### After deploying

Add your Vercel domain to Firebase:
- **Authentication** → Settings → Authorized domains → Add your `*.vercel.app` URL
- **Firestore** → Rules are already deployed separately

---

## Routes

| Path | Description |
|------|-------------|
| `/login` | Auth — login, register, password reset |
| `/dashboard` | Summary cards, revenue chart, recent invoices |
| `/invoices` | Full invoice list with search and status filters |
| `/invoices/new` | Create invoice |
| `/invoices/:id` | Invoice detail + PDF download + activity log |
| `/invoices/:id/edit` | Edit invoice |
| `/clients` | Client list with add / edit / delete |
| `/settings` | Business profile |

---

## Invoice Number Format

`BR-YYYY-XXXX` — auto-incremented per user per year. Resets to `0001` each new year.

## PDF Export

Branded PDF generated client-side via `@react-pdf/renderer`.
Filename: `BillReceipt-{invoiceNumber}.pdf`
Includes: business profile, client info, line items, totals, notes, footer.

---

## Project Structure

```
src/
├── assets/          # Logo SVG
├── components/      # Layout, Sidebar, InvoiceForm, LineItemsTable, modals...
├── context/         # AuthContext
├── hooks/           # useAuth, useClients, useInvoices, useBusinessProfile...
├── pages/           # Login, Dashboard, Invoices, Clients, InvoiceDetail, Settings
├── pdf/             # InvoiceDocument + styles (@react-pdf/renderer)
├── services/        # Firebase init, authService, clientService, invoiceService
└── utils/           # formatCurrency, calculateTotals, generateInvoiceNumber, dateHelpers
```
