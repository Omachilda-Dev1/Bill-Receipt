# Deploy to Vercel — Run These Commands

Open a terminal in the project folder and run these in order:

## Step 1 — Initialize git and make first commit

```bash
git init
git add .
git commit -m "feat: Bill Receipt v2.0 — full invoice management app"
```

## Step 2 — Create a GitHub repo and push

Go to https://github.com/new and create a new repo named `bill-receipt` (keep it empty — no README).

Then run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bill-receipt.git
git branch -M main
git push -u origin main
```

## Step 3 — Deploy on Vercel

1. Go to https://vercel.com → New Project
2. Import your `bill-receipt` GitHub repo
3. Vercel auto-detects Vite — leave build settings as-is
4. Under **Environment Variables**, add all 6 Firebase keys:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

5. Click **Deploy**

## Step 4 — Authorize your Vercel domain in Firebase

1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your `your-app.vercel.app` URL

Done. Every future `git push` to `main` will auto-deploy.
