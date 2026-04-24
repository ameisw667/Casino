# 🚀 Vercel Deployment Guide: Casino Project

This guide outlines the steps to take your **Next.js Casino** application live on Vercel.

## 📋 Prerequisites
1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com/signup).
2.  **GitHub/GitLab/Bitbucket Repo**: Your code must be pushed to a remote repository.
3.  **Clean Build**: Ensure `npm run build` works locally without errors.

---

## 🛠 Step 1: Connect to GitHub
The easiest way to deploy is through the Vercel Dashboard.

1.  Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** → **"Project"**.
3.  Select your GitHub account and import the `Casino` repository.

## ⚙️ Step 2: Configure Project Settings
Once imported, Vercel will auto-detect **Next.js**.

1.  **Project Name**: Choose a name (e.g., `vibe-casino`).
2.  **Framework Preset**: Ensure it says `Next.js`.
3.  **Root Directory**: Keep it as `./` (default).
4.  **Build and Output Settings**:
    *   Build Command: `npm run build`
    *   Output Directory: `.next`
    *   Install Command: `npm install`
5.  **Environment Variables**: 
    *   *Note: Currently, your project doesn't seem to use any `process.env` variables, but if you add a backend or API keys later, add them here.*

## 🚀 Step 3: Deploy
1.  Click **"Deploy"**.
2.  Vercel will start building your application. This usually takes 1-2 minutes.
3.  Once finished, you will get a production URL (e.g., `casino-six.vercel.app`).

---

## 🛠 Alternative: Vercel CLI (Optional)
If you prefer deploying from your terminal:

1.  **Install CLI**: `npm install -g vercel`
2.  **Login**: `vercel login`
3.  **Deploy**: Run `vercel` in the project root.
4.  **Production**: Run `vercel --prod` to push to the live domain.

---

## 🔍 Post-Deployment Checklist
- [ ] **Check Console**: Visit your live site and press `F12` to check for any runtime errors.
- [ ] **Custom Domain**: Go to **Settings > Domains** in Vercel to add a professional domain.
- [ ] **Analytics**: Enable Vercel Analytics in the dashboard to track visitors.
- [ ] **Speed Insights**: Check your Core Web Vitals directly in Vercel.

---

## ⚠️ Known Issues / Troubleshooting
- **Build Errors**: If the build fails on Vercel but works locally, delete `.next` and `node_modules` locally, run `npm install` and `npm run build` again to ensure no hidden local dependencies are missing.
- **Node Version**: Vercel defaults to Node 20.x or 22.x. Ensure your local version matches (check with `node -v`).

---

**Next Steps**: Once we have the first deployment, I can help you set up CI/CD so every push to your `main` branch automatically updates the live site.
