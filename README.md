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

