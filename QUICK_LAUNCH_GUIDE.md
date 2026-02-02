# 🎯 Quick Production Launch Guide

## What You Need to Change Right Now

### 1️⃣ Copy the Template (5 minutes)

```bash
cp .env.production.template .env.local
```

### 2️⃣ Fill in These Values (30 minutes)

Open `.env.local` and update:

```bash
# Generate new secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Your domain
NEXTAUTH_URL=https://mymealmuse.com

# Production database
MONGODB_URI='mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@your-cluster.mongodb.net/mealmuse_prod'

# Stripe LIVE keys (toggle dashboard to live mode)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...
STRIPE_PRICE_ID_EARLY_ADOPTER=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI keys (production)
GROQ_API_KEY=gsk_...
SPOONACULAR_API_KEY=...

# Admin emails
ADMIN_EMAILS=admin@mymealmuse.com
```

### 3️⃣ Stripe Setup (15 minutes)

**In Stripe Dashboard (LIVE MODE)**:

1. Create Products → Premium Monthly ($9.99/month)
2. Create Products → Premium Annual ($79/year)
3. Create Products → Early Adopter ($6.99/month)
4. Copy each price ID
5. Go to Webhooks → Add endpoint
   - URL: `https://mymealmuse.com/api/stripe/webhook`
   - Events: Select customer.subscription.\*, checkout.session.completed
6. Copy webhook secret

### 4️⃣ Database Setup (10 minutes)

1. Create production MongoDB cluster
2. Create database user
3. Whitelist deployment IP or allow from anywhere (0.0.0.0/0)
4. Copy connection string
5. Enable automated backups

### 5️⃣ Deploy (5 minutes)

- **Vercel**: Connect repo → Set env vars → Deploy
- **Other**: `npm run build` → `npm start`

---

## ⚠️ Critical Differences from Development

| Setting                 | Development             | Production               |
| ----------------------- | ----------------------- | ------------------------ |
| `NEXTAUTH_URL`          | `http://localhost:3000` | `https://mymealmuse.com` |
| `STRIPE_SECRET_KEY`     | `sk_test_...`           | `sk_live_...`            |
| `STRIPE_WEBHOOK_SECRET` | Test webhook            | Live webhook             |
| `MONGODB_URI`           | Dev cluster             | Production cluster       |
| `GROQ_API_KEY`          | Dev/test key            | Production key           |

---

## 🧪 Testing Checklist (Before Announcing)

Quick smoke tests:

- [ ] Visit homepage
- [ ] Register new account
- [ ] Login
- [ ] Create a recipe
- [ ] Browse recipes
- [ ] Add to favorites
- [ ] Subscribe (monthly plan) - **Use real card**
- [ ] Verify premium features unlock
- [ ] Test AI chat
- [ ] Cancel subscription
- [ ] Verify webhook logged in Stripe

---

## 🚨 Common Issues

### "Webhook signature verification failed"

→ Check `STRIPE_WEBHOOK_SECRET` is for **live** webhook, not test

### "Unauthorized" / Login fails

→ Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly

### Database connection fails

→ Check MongoDB IP whitelist and connection string

### Stripe checkout redirects to localhost

→ Verify `NEXTAUTH_URL` is production domain (no trailing slash)

---

## 📱 Share Your Beta

Once everything works, you can share:

- Landing page: `https://mymealmuse.com`
- Direct registration: `https://mymealmuse.com/auth/register`

**Early Adopter Pricing**: First 50 users get $6.99/month forever!

---

## 📊 What to Monitor

First 24 hours:

- Error logs (check deployment platform)
- Stripe webhook deliveries (Stripe dashboard)
- User registrations (MongoDB `users` collection)
- Premium conversions (MongoDB `earlyAdopters` collection)
- AI API usage (Groq console)

---

## 🔐 Security Reminders

✅ **DO**:

- Keep `.env.local` secret (never commit)
- Use different secrets than dev
- Monitor Stripe dashboard daily
- Rotate secrets quarterly

❌ **DON'T**:

- Share API keys publicly
- Use test keys in production
- Skip webhook signature verification
- Commit sensitive data

---

**Ready to launch?** Follow the [PRODUCTION_LAUNCH_CHECKLIST.md](PRODUCTION_LAUNCH_CHECKLIST.md) for the complete process.

**Questions?** Check the [PROGRESS_NOTES.md](PROGRESS_NOTES.md) for detailed implementation notes.

---

**Status**: All code ready ✅ | Just need production env vars ⚙️
