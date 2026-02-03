# Email Setup Guide - MealMuse

This guide explains how to configure email functionality for password resets and other notifications using Resend.

## Overview

MealMuse uses [Resend](https://resend.com) for sending transactional emails, including:
- Password reset links
- Welcome emails for new users
- Future: Recipe notifications, subscription updates, etc.

## Why Resend?

- **Simple API**: Easy to integrate with Next.js
- **Great deliverability**: High inbox placement rates
- **Developer-friendly**: No complex SMTP configuration
- **Generous free tier**: 3,000 emails/month free
- **Modern**: Built for developers, great documentation

## Setup Steps

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Navigate to [API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it (e.g., "MealMuse Production")
4. Copy the API key (starts with `re_`)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Resend API Key
RESEND_API_KEY=re_your_api_key_here

# Email sender address (see domain setup below)
EMAIL_FROM=MealMuse <noreply@mymealmuse.com>
```

### 4. Domain Setup (Production)

For production, you need to verify your domain to send emails from it.

#### Option A: Use Resend's Free Domain (Testing Only)

For development/testing, you can use:
```env
EMAIL_FROM=MealMuse <onboarding@resend.dev>
```

**Note**: This only works for sending to verified email addresses in your Resend account.

#### Option B: Use Your Own Domain (Recommended for Production)

1. Go to [Domains](https://resend.com/domains) in Resend
2. Click "Add Domain"
3. Enter your domain (e.g., `mymealmuse.com`)
4. Add the provided DNS records to your domain registrar:
   - SPF record
   - DKIM records (3 records)
   - DMARC record (optional but recommended)

**DNS Records Example**:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: TXT
Name: resend2._domainkey
Value: [provided by Resend]

Type: TXT
Name: resend3._domainkey
Value: [provided by Resend]
```

5. Wait for DNS propagation (can take up to 48 hours, usually much faster)
6. Resend will automatically verify your domain
7. Once verified, you can send from any email address at your domain:
   ```env
   EMAIL_FROM=MealMuse <noreply@mymealmuse.com>
   ```

### 5. Testing Email Functionality

#### Development Testing (Console Logging)

Without `RESEND_API_KEY` configured, emails will be logged to the console:

```bash
npm run dev
```

Then trigger a password reset and check the terminal output.

#### Production Testing (Real Emails)

1. Set up your Resend API key in `.env.local`
2. Request a password reset for your test account
3. Check your email inbox (and spam folder)
4. Click the reset link and verify it works

### 6. Verify Email Templates

Test the email templates by requesting a password reset:

1. Go to `/auth/forgot-password`
2. Enter your email
3. Check the email you receive
4. Verify it looks professional and all links work

## Email Templates

### Password Reset Email

**Location**: `lib/email.ts` - `sendPasswordResetEmail()`

**Features**:
- Professional HTML design
- MealMuse branding (logo, colors)
- Clear call-to-action button
- Security warning (1-hour expiration)
- Plain text fallback link
- Responsive design

**Preview**:
- Subject: "Reset Your MealMuse Password"
- Button: "Reset Password" (links to `/auth/reset-password?token=...`)
- Expiration: 1 hour

### Welcome Email (Optional)

**Location**: `lib/email.ts` - `sendWelcomeEmail()`

**Usage**: Can be called when new users register

```typescript
import { sendWelcomeEmail } from "@/lib/email";

// In registration endpoint
await sendWelcomeEmail(user.email, user.name);
```

## API Endpoints

### POST /api/auth/forgot-password

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "message": "If an account exists, a reset link has been sent to your email"
}
```

**Process**:
1. Validates email format
2. Checks if user exists (doesn't reveal if user doesn't exist - security)
3. Generates secure token (32 bytes, random)
4. Stores token in database with 1-hour expiry
5. Sends email with reset link
6. Returns success message (even if user doesn't exist)

### POST /api/auth/reset-password

**Request**:
```json
{
  "token": "abc123...",
  "password": "newpassword123"
}
```

**Response**:
```json
{
  "message": "Password reset successfully"
}
```

**Process**:
1. Validates token exists and hasn't expired
2. Hashes new password with bcrypt
3. Updates user password
4. Clears reset token from database
5. Returns success

## Security Features

### Token Generation
- Uses Node.js `crypto.randomBytes(32)` for secure tokens
- 32 bytes = 64 hex characters = 256 bits of entropy
- Cryptographically secure random number generator

### Token Expiry
- Tokens expire after 1 hour
- Checked on the server before accepting password reset
- Old tokens are automatically invalidated

### Password Hashing
- bcrypt with 10 rounds (salt rounds)
- Industry-standard password hashing
- Resistant to rainbow table attacks

### Email Enumeration Prevention
- Always returns success message even if email doesn't exist
- Prevents attackers from discovering valid email addresses
- Same response time regardless of email validity

### HTTPS Required
- All password reset links should use HTTPS in production
- Prevents token interception via man-in-the-middle attacks

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify `RESEND_API_KEY` is set correctly
2. **Check Console**: In development, emails are logged to console if API key is missing
3. **Verify Domain**: In production, ensure your domain is verified in Resend
4. **Check Spam**: Password reset emails might land in spam folder
5. **API Limits**: Free tier has 3,000 emails/month limit

### 404 Error on Reset Link

The reset password page is at `/auth/reset-password`. If you're getting a 404:

1. **Check File Exists**: `app/auth/reset-password/page.tsx` should exist
2. **Rebuild**: Run `npm run build` to ensure the page is included
3. **Check URL**: URL should be `https://yourdomain.com/auth/reset-password?token=...`
4. **Clear Cache**: Clear browser cache and try again
5. **Check Deployment**: Ensure the file is included in your deployment

### Token Expired Error

Tokens expire after 1 hour. If you get this error:
1. Request a new password reset
2. Complete the process within 1 hour
3. Check that your system clock is correct

### Email Not Received

1. **Check Spam Folder**: Reset emails might be filtered
2. **Check Email Address**: Ensure you entered the correct email
3. **Wait a Few Minutes**: Email delivery can take 1-5 minutes
4. **Check Resend Dashboard**: Go to [Resend Logs](https://resend.com/logs) to see if email was sent
5. **Domain Verification**: In production, ensure domain is fully verified

## Production Checklist

Before going live, ensure:

- [ ] Resend account created and API key obtained
- [ ] Domain verified in Resend with proper DNS records
- [ ] `RESEND_API_KEY` added to production environment variables
- [ ] `EMAIL_FROM` set to your verified domain email
- [ ] `NEXTAUTH_URL` set to production domain (https://)
- [ ] Password reset flow tested end-to-end
- [ ] Email templates tested and look professional
- [ ] Email deliverability tested (check inbox, not spam)
- [ ] SSL certificate installed (HTTPS working)
- [ ] Database has `resetToken` and `resetTokenExpiry` fields on users

## Monitoring

### Resend Dashboard

Monitor email delivery in the [Resend Dashboard](https://resend.com/logs):
- View all sent emails
- Check delivery status
- See bounce rates
- Monitor API usage

### Application Logs

Check your application logs for:
```
Email sent successfully: [email_id]
Failed to send password reset email to: [email]
```

## Cost

**Free Tier** (Current):
- 3,000 emails/month
- 100 emails/day
- All features included

**Paid Plans** (if needed):
- $20/month for 50,000 emails
- $80/month for 300,000 emails
- Enterprise: Custom pricing

For MealMuse's expected volume, the free tier should be sufficient for initial launch.

## Future Enhancements

Potential email features to add:

1. **Welcome Email**: Send when users register
2. **Recipe Shared**: Notify when someone shares a recipe with you
3. **Weekly Digest**: Popular recipes of the week
4. **Subscription Reminders**: Payment due, trial ending, etc.
5. **Activity Notifications**: Comments on your recipes, likes, etc.

All can use the same `lib/email.ts` utility with additional template functions.

## Support

- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **MealMuse Email Code**: `lib/email.ts`

## Summary

Email is now fully configured for:
✅ Password reset emails with professional templates
✅ Secure token generation and validation
✅ Development mode (console logging) and production mode (real emails)
✅ Email enumeration prevention for security
✅ Responsive, branded email templates
✅ Easy to extend with new email types

Just add your Resend API key and domain, and you're ready to go!
