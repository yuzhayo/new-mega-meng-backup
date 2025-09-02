# PythonAnywhere Deployment Guide

## Prerequisites
- PythonAnywhere account (free tier is sufficient for testing)
- MongoDB Atlas account (or other cloud MongoDB provider)
- Basic familiarity with PythonAnywhere dashboard

## Step 1: Prepare MongoDB Database

### Option A: MongoDB Atlas (Recommended)
1. Create account at https://cloud.mongodb.com/
2. Create free cluster
3. Create database user with read/write permissions
4. Whitelist PythonAnywhere IP addresses or use 0.0.0.0/0 for testing
5. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### Option B: Local MongoDB
- Not recommended for production, but you can use MongoDB Atlas free tier

## Step 2: Upload Files to PythonAnywhere

### Method A: Git (Recommended)
```bash
# In PythonAnywhere console
cd ~
git clone YOUR_REPOSITORY_URL mysite
cd mysite/backend
```

### Method B: File Upload
1. Use PythonAnywhere Files tab
2. Upload the entire `backend/` folder to `/home/yourusername/mysite/backend/`

## Step 3: Configure Environment Variables

1. In PythonAnywhere dashboard, go to Files
2. Navigate to `/home/yourusername/mysite/backend/`
3. Create `.env` file with the following content:

```bash
# MongoDB Configuration
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/launcher_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET_KEY=your-super-secure-jwt-secret-key-for-production-min-32-chars-long
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# Simple Authentication (Optional)
MASTER_PASSWORD=your-secure-master-password

# CORS Configuration
CORS_ORIGINS=https://your-netlify-app.netlify.app,https://yourdomain.com

# Database Name
DB_NAME=launcher_db

# Production Flag
PRODUCTION=true
```

## Step 4: Install Dependencies

```bash
# In PythonAnywhere console
cd /home/yourusername/mysite/backend
pip3.10 install --user -r requirements.txt
```

## Step 5: Configure Web App

1. Go to PythonAnywhere **Web** tab
2. Click **Add a new web app**
3. Choose **Manual configuration**
4. Select **Python 3.10**
5. Set the following configurations:

### Source Code:
```
/home/yourusername/mysite/backend
```

### Working Directory:
```
/home/yourusername/mysite/backend
```

### WSGI Configuration File:
```
/home/yourusername/mysite/backend/wsgi.py
```

## Step 6: Update WSGI File

1. Go to **Web** tab → **WSGI configuration file**
2. Replace content with:

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/yourusername/mysite/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables
os.environ.setdefault('PRODUCTION', 'true')

# Import the FastAPI application
from server import app

# WSGI application
application = app
```

## Step 7: Test Deployment

1. Click **Reload** button in Web tab
2. Visit `https://yourusername.pythonanywhere.com`
3. Test endpoints:
   - `GET /` should return {"message": "Launcher API is running"}
   - `GET /api/health` should return health status

## Step 8: Update Frontend

Update your Netlify app environment variables:
- Set `REACT_APP_BACKEND_URL=https://yourusername.pythonanywhere.com`

## Authentication Setup

### Option 1: Full Authentication (Email/Password)
1. Uncomment full auth code in frontend `App.tsx`
2. Users can register with email/password
3. JWT tokens handle sessions

### Option 2: Simple Password Authentication
1. Set `MASTER_PASSWORD` in backend `.env`
2. Uncomment simple auth endpoint in `server.py` (lines 270-288)
3. Uncomment simple auth in frontend `App.tsx`
4. Single password for all users

## Troubleshooting

### Common Issues:

1. **Import Errors**
   - Check WSGI file paths
   - Ensure all dependencies installed

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check IP whitelist in MongoDB Atlas
   - Test connection from PythonAnywhere console

3. **CORS Errors**
   - Update `CORS_ORIGINS` in `.env`
   - Include your exact Netlify domain

4. **Authentication Not Working**
   - Check JWT_SECRET_KEY is set
   - Verify endpoints are uncommented if using simple auth

### Debug Commands:
```bash
# Test MongoDB connection
python3.10 -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv
load_dotenv()
async def test():
    client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
    try:
        await client.admin.command('ping')
        print('MongoDB connected successfully!')
    except Exception as e:
        print(f'MongoDB connection failed: {e}')
    finally:
        client.close()
asyncio.run(test())
"

# Test FastAPI app
python3.10 -c "from server import app; print('App imported successfully')"
```

## Security Checklist

- [ ] Strong JWT_SECRET_KEY (32+ characters)
- [ ] Specific CORS origins (no wildcards in production)
- [ ] Strong MASTER_PASSWORD (if using simple auth)
- [ ] MongoDB user has minimum required permissions
- [ ] Environment variables are not committed to Git

## Support

- PythonAnywhere Help: https://help.pythonanywhere.com/
- FastAPI Documentation: https://fastapi.tiangolo.com/
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/