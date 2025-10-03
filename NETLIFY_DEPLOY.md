# Netlify Deployment Guide for INFERA

## 🚀 Quick Deploy to Netlify

### Method 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**
```bash
netlify login
```

3. **Deploy from project root**
```bash
cd "h:\ikam apps\project"
netlify deploy --prod
```

### Method 2: Deploy via GitHub Integration

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your `Infra` repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-api.com/api`)
6. Click "Deploy site"

### Method 3: Manual Deploy

1. **Build the project locally**
```bash
cd frontend
npm install
npm run build
```

2. **Drag and drop** the `frontend/dist` folder to Netlify

## 📋 Pre-Deployment Checklist

- ✅ Build configuration added to `netlify.toml`
- ✅ Environment variables configured (`.env.production`)
- ✅ API client updated to use environment variables
- ✅ Vite config optimized for production
- ✅ Build tested locally

## 🔧 Configuration Files

### netlify.toml
Located at project root - configures Netlify build settings and redirects.

### .env.production
Update this file with your production backend URL:
```
VITE_API_URL=https://your-backend-api-url.com/api
```

## ⚙️ Backend Deployment

Your backend needs to be deployed separately. Options:

1. **Railway**: Easy Python deployment
2. **Heroku**: Classic PaaS
3. **Render**: Modern hosting platform
4. **AWS/GCP/Azure**: Cloud platforms
5. **DigitalOcean**: App Platform

After deploying backend, update `VITE_API_URL` in Netlify environment variables.

## 🧪 Test Build Locally

```bash
cd frontend
npm run build
npm run preview
```

Visit: http://localhost:4173

## 📝 Post-Deployment

1. Update backend URL in Netlify environment variables
2. Configure CORS on your backend to allow Netlify domain
3. Set up custom domain (optional)
4. Enable HTTPS (automatic on Netlify)
5. Configure redirects if needed

## 🐛 Troubleshooting

**Build fails?**
- Check Node version (needs 18+)
- Verify all dependencies in package.json
- Check build logs in Netlify dashboard

**API calls failing?**
- Verify VITE_API_URL is set correctly
- Check CORS settings on backend
- Verify backend is accessible from internet

**Blank page?**
- Check browser console for errors
- Verify base path in vite.config.js
- Check redirects in netlify.toml

## 📞 Support

If you encounter issues:
1. Check Netlify build logs
2. Test build locally first
3. Verify all environment variables
4. Check backend CORS settings
