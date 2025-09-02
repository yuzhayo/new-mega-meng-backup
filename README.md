# Launcher Interface Application

A sophisticated gesture-based launcher application with React frontend and FastAPI backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Git

### Local Development

1. **Clone and setup**
```bash
git clone <your-repo-url>
cd launcher-app
```

2. **Backend setup**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python server.py
```

3. **Frontend setup**
```bash
cd frontend
npm install
cp .env.development .env
npm run dev
```

## 🌐 Deployment

### Netlify (Frontend)

1. **Connect GitHub repository** to Netlify
2. **Build settings**:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/dist`
   - Node version: `20`

3. **Environment variables** (Netlify dashboard):
   ```
   REACT_APP_BACKEND_URL=https://yourusername.pythonanywhere.com
   ```

### PythonAnywhere (Backend)

1. **Upload files** to `/home/yourusername/mysite/backend/`
2. **Install dependencies**:
   ```bash
   pip3.10 install --user -r requirements.txt
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Web app settings**:
   - Source code: `/home/yourusername/mysite/backend`
   - WSGI file: `/home/yourusername/mysite/backend/wsgi.py`
   - Update `wsgi.py` with correct paths

## 🔧 Configuration

### Authentication Options

**Option 1: No Authentication (Current)**
- Launcher loads directly without login

**Option 2: Simple Password**
1. Set `MASTER_PASSWORD` in backend `.env`
2. Enable in `frontend/src/App.tsx` (uncomment SimpleAuthApp)

**Option 3: Full Authentication**
1. Enable in `frontend/src/App.tsx` (uncomment FullAuthApp)
2. Users can register/login with email

### Features

- ✨ **Gesture Control**: Triple-tap to show/hide launcher
- 🎯 **App Management**: Add, edit, delete launcher apps
- ⚙️ **Preferences**: Customizable themes and settings
- 🔐 **Authentication**: Multiple auth options
- 📱 **Responsive**: Works on desktop and mobile

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt  
- CORS protection
- Input validation with Pydantic

## 🛠 Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI, Python, JSON storage
- **Deployment**: Netlify + PythonAnywhere
- **Auth**: JWT, bcrypt, python-jose

## 📁 Project Structure

```
launcher-app/
├── frontend/           # React application
│   ├── src/
│   │   ├── Core/Launcher/  # Launcher components
│   │   ├── components/     # UI components  
│   │   ├── api/           # API client
│   │   └── context/       # React contexts
│   ├── package.json
│   └── netlify.toml
├── backend/            # FastAPI application
│   ├── server.py       # Main application
│   ├── wsgi.py        # PythonAnywhere WSGI
│   ├── data/          # JSON storage (gitignored)
│   └── requirements.txt
└── README.md
```

## 🚨 Important Notes

- Backend uses **JSON file storage** (not MongoDB)
- All endpoints are **synchronous** for PythonAnywhere
- Frontend configured as **standalone module**
- Data stored in `backend/data/` (auto-created)

## 📞 Support

For deployment issues:
- Netlify: Check build logs in dashboard
- PythonAnywhere: Check error logs in Files tab
- CORS issues: Update `CORS_ORIGINS` in backend `.env`