# Local Testing Guide

This guide will help you test the project locally to determine if issues are with the code or hosting.

## Quick Start

### Step 1: Install Dependencies

From the project root directory:

```bash
npm run install:all
```

Or install separately:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Verify Environment Variables

Make sure your `.env` file exists in the project root with:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
NODE_ENV=development
```

### Step 3: Run Both Servers

**Option A: Run both together (recommended)**
```bash
npm run dev
```

This will start:
- Backend on `http://localhost:3001`
- Frontend on `http://localhost:3000`

**Option B: Run separately**

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
```

### Step 4: Test the Application

1. **Open your browser**: Navigate to `http://localhost:3000`
2. **Test URL scanning**: Enter a URL and click "Scan"
3. **Check backend logs**: Look at the terminal running the backend for any errors

## Testing Individual Components

### Test Backend API Directly

**Health Check:**
```bash
curl http://localhost:3001/health
```
Expected response: `{"status":"ok"}`

**Scan a URL:**
```bash
curl -X POST http://localhost:3001/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "google.com"}'
```

Expected response: JSON with scan results

### Test Frontend Only

If you want to test the frontend against your Vercel backend:

1. Create/update `.env.local` in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=https://your-vercel-url.vercel.app
   ```

2. Run frontend:
   ```bash
   cd frontend
   npm run dev
   ```

## Troubleshooting

### Backend won't start

**Check if port 3001 is in use:**
```bash
lsof -i :3001
```

**Kill process if needed:**
```bash
kill -9 <PID>
```

**Check environment variables:**
```bash
cd backend
node -e "require('dotenv').config({ path: '../.env' }); console.log('API Key:', process.env.GROQ_API_KEY ? 'Set' : 'Missing');"
```

### Frontend won't start

**Check if port 3000 is in use:**
```bash
lsof -i :3000
```

**Clear Next.js cache:**
```bash
cd frontend
rm -rf .next
npm run dev
```

### API calls failing

1. **Check backend is running**: Visit `http://localhost:3001/health`
2. **Check CORS**: Backend should allow `http://localhost:3000`
3. **Check browser console**: Open DevTools (F12) → Console tab
4. **Check network tab**: Open DevTools → Network tab, look for failed requests

### Common Errors

**"GROQ_API_KEY is not configured"**
- Make sure `.env` file exists in project root
- Verify the API key is set correctly
- Restart the backend server after changing `.env`

**"Cannot find module"**
- Run `npm install` in the affected directory
- Delete `node_modules` and `package-lock.json`, then reinstall

**"Port already in use"**
- Change the port in `.env` (e.g., `PORT=3002`)
- Or kill the process using the port

## Expected Behavior

### Backend Console Output
```
Backend server running on port 3001
✓ Groq API key loaded (length: 56, starts with: gsk_...)
Scan request for URL: https://google.com
Scan result: google.com - Safe
```

### Frontend
- Should load at `http://localhost:3000`
- URL input field should be visible
- After scanning, results should display
- No errors in browser console

### API Response Format
```json
{
  "url": "https://google.com",
  "final_label": "Safe",
  "confidence": 95,
  "summary": "...",
  "iocs": [...],
  "recommendations": [...],
  "model_metadata": {
    "model": "llama-3.1-8b-instant",
    "latency_ms": 1200
  },
  "timestamp": "2025-11-24T19:05:00Z"
}
```

## Comparing Local vs Hosted

If local works but hosted doesn't:
- Check Vercel environment variables
- Check Vercel function logs
- Verify `vercel.json` configuration
- Check if root directory is set correctly in Vercel

If local doesn't work:
- Check error messages in terminal
- Verify `.env` file is correct
- Check Node.js version (should be 18+)
- Review error logs above

