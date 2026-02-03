# Seed Production Database

## ✅ TypeScript Errors Fixed

The build errors have been fixed. Now you can deploy!

---

## 🚀 Deploy to Production

### Step 1: Push Your Changes

```bash
git add .
git commit -m "Add analytics, SEO, fractions, and seeded recipes"
git push origin phase2-stripe-integration-clean
```

### Step 2: Wait for Vercel Deployment

- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- Wait for the deployment to complete (usually 1-2 minutes)
- Make sure it says "Ready" ✅

### Step 3: Add Environment Variable to Vercel

**Before seeding, add this to Vercel:**

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Name**: `ADMIN_API_KEY`
   - **Value**: `bwS0bW2ED476ygEdf8RM2CeQdC6Sxx/REy/6SCGeOKQ=`
   - **Environments**: Check all (Production, Preview, Development)
4. Click **Save**

### Step 4: Seed Production Database

**Option 1 - PowerShell (Windows):**

```powershell
$headers = @{
    "x-api-key" = "bwS0bW2ED476ygEdf8RM2CeQdC6Sxx/REy/6SCGeOKQ="
}
Invoke-RestMethod -Uri "https://mymealmuse.com/api/admin/seed-recipes" -Method POST -Headers $headers
```

**Option 2 - Bash/Terminal:**

```bash
curl -X POST https://mymealmuse.com/api/admin/seed-recipes \
  -H "x-api-key: bwS0bW2ED476ygEdf8RM2CeQdC6Sxx/REy/6SCGeOKQ="
```

### Step 5: Verify

Visit https://mymealmuse.com/recipes and you should see:

- ✅ 15 seeded recipes with proper amounts
- ✅ Ingredient amounts showing as fractions
- ✅ All your original recipes still there

---

## 🎯 Expected Response

```json
{
  "message": "Seeded recipes added successfully",
  "deletedCount": 0,
  "insertedCount": 15
}
```

---

## ⚠️ Important Notes

1. **Your original recipes are safe** - only recipes with `source: "seeded"` are affected
2. **Run this only once** - it will replace existing seeded recipes
3. **Save your API key** - keep `bwS0bW2ED476ygEdf8RM2CeQdC6Sxx/REy/6SCGeOKQ=` secure

---

## 🔧 Troubleshooting

**"Unauthorized" error?**

- Make sure you added `ADMIN_API_KEY` to Vercel environment variables
- Redeploy after adding the variable

**"Connection refused"?**

- Make sure your deployment is complete and live
- Check that the URL is correct (https://mymealmuse.com)

**No recipes showing?**

- Check the response - it should show `insertedCount: 15`
- Refresh the recipes page
- Check browser console for errors
