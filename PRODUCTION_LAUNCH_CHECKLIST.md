# 🚀 MealMuse Production Launch Checklist

## 📋 Pre-Launch Requirements

### 1. Environment Variables (CRITICAL)

- [ ] Copy `.env.production.template` to `.env.local`
- [ ] Generate new `NEXTAUTH_SECRET` (run: `openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to production domain (e.g., `https://mymealmuse.com`)
- [ ] Update `MONGODB_URI` to production cluster
- [ ] Rotate all API keys to production versions

### 2. Stripe Configuration (CRITICAL)

- [ ] Switch Stripe Dashboard to **LIVE mode** (toggle in bottom-left)
- [ ] Copy **live** secret key (`sk_live_...`)
- [ ] Copy **live** publishable key (`pk_live_...`)
- [ ] Create live products/prices:
  - [ ] Premium Monthly ($9.99/month)
  - [ ] Premium Annual ($79/year)
  - [ ] Early Adopter ($6.99/month)
- [ ] Copy live price IDs to `.env.local`
- [ ] Create **live webhook endpoint**:
  - URL: `https://mymealmuse.com/api/stripe/webhook`
  - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`
  - Copy live webhook secret (`whsec_...`)
- [ ] Verify success/cancel URLs point to production domain
- [ ] Test a real payment in live mode (use real card)

### 3. Database (CRITICAL)

- [ ] Create production MongoDB cluster (separate from dev)
- [ ] Set up database backups/replication
- [ ] Create production database user with appropriate permissions
- [ ] Update connection string in `.env.local`
- [ ] Verify network access/IP whitelist allows production deployment
- [ ] Test database connectivity from production environment

### 4. Domain & DNS (CRITICAL)

- [ ] Domain purchased and configured
- [ ] DNS records pointing to deployment platform
- [ ] SSL/HTTPS certificate provisioned
- [ ] Verify `mymealmuse.com` resolves correctly
- [ ] Test both www and non-www versions

### 5. Security & Auth

- [ ] `NEXTAUTH_SECRET` is unique and different from dev
- [ ] `NEXTAUTH_URL` matches production domain exactly
- [ ] All API keys rotated to production versions
- [ ] `.env.local` added to `.gitignore` (already done ✅)
- [ ] No sensitive data committed to git
- [ ] Admin emails configured in `ADMIN_EMAILS`

### 6. AI Services

- [ ] Groq API production key configured
- [ ] Groq rate limits reviewed (current: free tier)
- [ ] Spoonacular API production key (if used)
- [ ] Monitor AI API usage/costs

### 7. Code Cleanup (RECOMMENDED)

- [ ] Remove or secure `/app/debug/page.tsx` (exposes session data)
- [ ] Review and remove any console.log statements
- [ ] Verify error messages don't expose sensitive info
- [ ] Check for any hardcoded test data

### 8. Testing

- [ ] Test user registration flow
- [ ] Test login/logout
- [ ] Test recipe creation
- [ ] Test recipe browsing/filtering
- [ ] Test favorites functionality
- [ ] Test shopping list
- [ ] Test Stripe checkout (monthly/annual/early adopter)
- [ ] Test Stripe webhook (create/cancel subscription)
- [ ] Test premium features (AI chat, recipe generator)
- [ ] Test admin approval workflow
- [ ] Test on mobile devices
- [ ] Test on different browsers

### 9. Monitoring & Alerts (RECOMMENDED)

- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up Stripe webhook failure alerts
- [ ] Monitor database performance
- [ ] Track AI API usage/costs

### 10. Performance & Optimization

- [ ] Run production build locally: `npm run build`
- [ ] Verify build succeeds with no errors
- [ ] Check bundle size
- [ ] Test loading performance
- [ ] Optimize images (if any large assets)

---

## 🔧 Deployment Steps

### Option A: Vercel Deployment (Recommended)

1. Connect GitHub repo to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy to production
4. Verify deployment URL
5. Configure custom domain
6. Test all functionality

### Option B: Other Platforms (AWS, DigitalOcean, etc.)

1. Build production bundle: `npm run build`
2. Start production server: `npm start`
3. Configure reverse proxy (nginx)
4. Set up SSL/HTTPS
5. Configure environment variables
6. Monitor logs and performance

---

## 📊 Post-Launch Monitoring

### First 24 Hours

- [ ] Monitor error logs
- [ ] Check Stripe webhook deliveries
- [ ] Verify user registrations work
- [ ] Monitor database connections
- [ ] Check AI API usage
- [ ] Respond to any user feedback

### First Week

- [ ] Review analytics/usage patterns
- [ ] Monitor conversion rates (free → premium)
- [ ] Check for any recurring errors
- [ ] Optimize based on real usage
- [ ] Gather user feedback

---

## 🚨 Rollback Plan

If critical issues occur:

1. Revert to previous deployment
2. Check error logs
3. Verify environment variables
4. Test in staging environment
5. Fix issues before re-deploying

---

## 📞 Support Contacts

- **Stripe Support**: https://support.stripe.com
- **MongoDB Support**: https://support.mongodb.com
- **Groq Support**: https://console.groq.com
- **Domain Registrar**: [Your registrar]
- **Hosting Platform**: [Vercel/AWS/etc.]

---

## 🔐 Security Notes

**DO NOT**:

- Commit `.env.local` to git
- Share API keys publicly
- Use test Stripe keys in production
- Expose admin routes without authentication
- Store passwords in plain text

**DO**:

- Rotate secrets regularly
- Monitor for suspicious activity
- Keep dependencies updated
- Use HTTPS everywhere
- Implement rate limiting (future enhancement)

---

**Last Updated**: February 1, 2026
**Status**: Ready for Production Launch 🚀
