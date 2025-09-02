# 🚀 Deployment Guide

## ✅ Pre-Deployment Checklist

### GitHub Setup
- [ ] Repository connected to GitHub
- [ ] `.gitignore` configured (excludes `node_modules`, `.env`, `backend/data/`)
- [ ] All changes committed and pushed
- [ ] README.md updated with project info

### Frontend (Netlify)
- [ ] Build test passed: `cd frontend && npm run build` ✅
- [ ] `netlify.toml` configured with Node 20 ✅
- [ ] Environment variables ready for Netlify dashboard
- [ ] SPA redirects configured ✅

### Backend (PythonAnywhere)
- [ ] MongoDB dependencies removed ✅
- [ ] Converted to sync FastAPI ✅
- [ ] JSON file storage configured ✅
- [ ] WSGI file ready ✅
- [ ] Requirements.txt updated ✅

## 🌐 Deployment Steps

### 1. Netlify Frontend Deployment

**Connect Repository:**
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   ```
   Build command: cd frontend && npm run build
   Publish directory: frontend/dist
   ```

**Environment Variables:**
In Netlify dashboard → Site settings → Environment variables:
```
REACT_APP_BACKEND_URL=https://yourusername.pythonanywhere.com
```

**Domain Setup:**
- Use provided `.netlify.app` domain or configure custom domain
- Update `CORS_ORIGINS` in backend with your actual Netlify URL

### 2. PythonAnywhere Backend Deployment

**File Upload:**
1. Upload entire `backend/` folder to `/home/yourusername/mysite/backend/`
2. Or use Git: `git clone <repo-url> mysite`

**Dependencies:**
```bash
cd /home/yourusername/mysite/backend
pip3.10 install --user -r requirements.txt
```

**Environment Configuration:**
```bash
cp .env.example .env
nano .env
```

Update `.env` with:
```bash
JWT_SECRET_KEY=your-super-secure-jwt-secret-key-32-chars-minimum
MASTER_PASSWORD=your-secure-master-password
CORS_ORIGINS=https://your-netlify-app.netlify.app
PRODUCTION=true
```

**Web App Configuration:**
1. Go to PythonAnywhere Web tab
2. Add new web app → Manual configuration → Python 3.10
3. Set paths:
   - Source code: `/home/yourusername/mysite/backend`
   - Working directory: `/home/yourusername/mysite/backend`
   - WSGI file: `/home/yourusername/mysite/backend/wsgi.py`

**Update WSGI File:**
Edit the path in `wsgi.py`:
```python
project_home = '/home/yourusername/mysite/backend'  # Update this line
```

## 🔧 Post-Deployment Testing

### Backend Tests
```bash
# Health check
curl https://yourusername.pythonanywhere.com/api/health

# Test simple auth (if enabled)
curl -X POST https://yourusername.pythonanywhere.com/api/auth/simple-login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-master-password"}'
```

### Frontend Tests
1. Visit your Netlify URL
2. Test triple-tap gesture (should show/hide launcher button)
3. Check browser console for any errors
4. Verify CORS is working (no network errors)

## 🚨 Common Issues & Solutions

### CORS Errors
- Update `CORS_ORIGINS` in backend `.env` with exact Netlify URL
- Restart PythonAnywhere web app after changes

### Build Failures
- Node version: Ensure Node 20 in Netlify settings
- Dependencies: Run `npm install` in frontend folder
- TypeScript: Fix any TS errors before deployment

### Backend 500 Errors
- Check PythonAnywhere error logs
- Verify all dependencies installed
- Ensure `.env` file exists with required variables

### Authentication Issues
- For simple auth: Uncomment endpoint in `server.py`
- For full auth: Enable in `App.tsx`
- Check JWT_SECRET_KEY is set

## 📊 Current Status

**✅ Ready for Deployment:**
- Backend: Sync FastAPI with JSON storage
- Frontend: React build successful
- Configuration: All files prepared
- Documentation: Complete guides provided

**🔧 Architecture:**
- Frontend: React → Netlify
- Backend: FastAPI → PythonAnywhere  
- Storage: JSON files (no database needed)
- Auth: Simple password available

## 🎯 Next Steps After Deployment

1. **Test thoroughly** on both staging and production
2. **Monitor logs** for any issues
3. **Configure custom domains** if needed
4. **Set up monitoring** and alerts
5. **Enable authentication** if required
6. **Add analytics** and error tracking

---

**Support:** Check README.md for additional configuration options and troubleshooting guides.