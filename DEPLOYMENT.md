# Deployment Guide

This guide explains how to deploy the Malicious URL Scanner to GitHub Pages (frontend) and Vercel (backend).

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Groq API key

## Backend Deployment (Vercel)

### Step 1: Prepare Backend for Vercel

The backend is already configured for Vercel serverless functions. The entry point is at `api/index.ts` (root level).

### Step 2: Deploy to Vercel

**IMPORTANT**: When deploying, make sure the **Root Directory** is set to the project root (`.`), NOT `backend`.

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to project root**:
   ```bash
   cd "/Users/simardhanda/Desktop/projects/Malicious URL Scanner/Malicious-URL-Scanner"
   ```

4. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (select your account)
   - Link to existing project? **No**
   - Project name? (press Enter for default or enter a name)
   - **Directory?** Enter `.` (project root) - **DO NOT use `./backend`**
   - Override settings? **No**

5. **If you already deployed with wrong root directory**:
   - Go to your project on [vercel.com](https://vercel.com)
   - Go to **Settings** → **General**
   - Under **Root Directory**, change it to `.` (project root)
   - Save and redeploy

5. **Set Environment Variables**:
   ```bash
   vercel env add GROQ_API_KEY
   ```
   Paste your Groq API key when prompted.
   
   Optionally set the model:
   ```bash
   vercel env add GROQ_MODEL
   ```
   Enter: `llama-3.1-8b-instant` (or your preferred model)

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

7. **Copy the deployment URL**:
   After deployment, Vercel will show you a URL like: `https://your-project.vercel.app`
   
   **Save this URL** - you'll need it for the frontend configuration.

### Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (or `npm run build` if you have one)
   - **Output Directory**: Leave empty
5. Add Environment Variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `GROQ_MODEL`: `llama-3.1-8b-instant` (optional)
6. Click "Deploy"

## Frontend Deployment (GitHub Pages)

### Step 1: Configure GitHub Repository

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**
   - Save

### Step 2: Configure Frontend API URL

1. **Add GitHub Secret**:
   - Go to your repository → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: Your Vercel backend URL (e.g., `https://your-project.vercel.app`)
   - Click **Add secret**

### Step 3: Deploy

The GitHub Actions workflow will automatically deploy when you push to `main` branch.

**Manual trigger**:
- Go to **Actions** tab
- Select "Deploy Frontend to GitHub Pages"
- Click **Run workflow**

### Step 4: Access Your Site

After deployment, your site will be available at:
```
https://yourusername.github.io/your-repo-name/
```

If your repository name is different, the URL will be:
```
https://yourusername.github.io/repository-name/
```

## Configuration Summary

### Backend (Vercel)
- **URL**: `https://your-project.vercel.app`
- **Endpoints**:
  - `POST /scan` - Scan a URL
  - `GET /health` - Health check
- **Environment Variables**:
  - `GROQ_API_KEY` (required)
  - `GROQ_MODEL` (optional, defaults to `llama-3.1-8b-instant`)

### Frontend (GitHub Pages)
- **URL**: `https://yourusername.github.io/repository-name/`
- **Environment Variable**:
  - `NEXT_PUBLIC_API_URL` - Set to your Vercel backend URL

## Troubleshooting

### Backend Issues

**CORS Errors**:
- The backend is configured to allow all origins. If you need to restrict, update `backend/api/index.ts`:
  ```typescript
  app.use(cors({
    origin: 'https://yourusername.github.io'
  }));
  ```

**Environment Variables Not Loading**:
- Make sure variables are set in Vercel dashboard under **Settings** → **Environment Variables**
- Redeploy after adding variables

### Frontend Issues

**API Calls Failing**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly in GitHub Secrets
- Check browser console for CORS errors
- Verify backend is deployed and accessible

**Build Fails**:
- Check GitHub Actions logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version in workflow matches your local version

**404 on GitHub Pages**:
- If using a custom domain or subdirectory, update `basePath` in `next.config.js`
- Ensure `output: 'export'` is set in `next.config.js`

## Testing Deployment

1. **Test Backend**:
   ```bash
   curl https://your-project.vercel.app/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Frontend**:
   - Visit your GitHub Pages URL
   - Try scanning a URL
   - Check browser console for errors

## Updating Deployments

### Backend Updates
```bash
vercel --prod
```

### Frontend Updates
- Push to `main` branch
- GitHub Actions will automatically redeploy

## Cost Considerations

- **GitHub Pages**: Free
- **Vercel**: Free tier includes:
  - 100GB bandwidth/month
  - Serverless function execution time
  - Sufficient for MVP usage

## Security Notes

- Never commit `.env` files
- Use environment variables for all secrets
- API keys are stored securely in Vercel/GitHub Secrets
- Rate limiting is enabled (30 requests/hour per IP)

