# Vercel 404 Debugging Guide

## Steps to Debug

1. **Check Vercel Function Logs**:
   - Go to your Vercel project dashboard
   - Click on the failed deployment
   - Go to the "Functions" tab
   - Click on the function to see logs
   - Look for import errors or runtime errors

2. **Check Build Logs**:
   - In the deployment, check "Build Logs"
   - Look for any errors during installation or build

3. **Verify Root Directory**:
   - Settings → General → Root Directory
   - Should be `.` (project root), NOT `backend`

4. **Test the Function Directly**:
   - Try accessing: `https://your-project.vercel.app/api/index`
   - This should show the function if it's working

## Common Issues

### Issue 1: Function Not Found
- **Symptom**: 404 on all routes
- **Fix**: Check that `api/index.ts` exists and is committed to git

### Issue 2: Import Errors
- **Symptom**: Function logs show "Cannot find module"
- **Fix**: Ensure backend files are included and dependencies are installed

### Issue 3: TypeScript Not Compiling
- **Symptom**: Function fails to load
- **Fix**: Vercel should auto-compile TypeScript, but check logs

## Quick Test

Try accessing these URLs:
- `https://your-project.vercel.app/api/index` - Should show function
- `https://your-project.vercel.app/health` - Should return JSON
- `https://your-project.vercel.app/scan` - Should accept POST

