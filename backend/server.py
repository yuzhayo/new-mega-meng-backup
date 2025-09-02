"""
FastAPI Backend for Launcher Interface Application
Sync version configured for PythonAnywhere deployment
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv
import json
from pathlib import Path

# Load environment variables
load_dotenv()

# Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-here")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
PRODUCTION = os.getenv("PRODUCTION", "false").lower() == "true"

# JSON file storage setup
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

USERS_FILE = DATA_DIR / "users.json"
APPS_FILE = DATA_DIR / "apps.json" 
PREFERENCES_FILE = DATA_DIR / "preferences.json"

# Initialize JSON files if they don't exist
for file_path in [USERS_FILE, APPS_FILE, PREFERENCES_FILE]:
    if not file_path.exists():
        file_path.write_text("[]" if file_path != PREFERENCES_FILE else "{}")

def load_json_data(file_path: Path) -> Any:
    """Load data from JSON file"""
    try:
        return json.loads(file_path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return [] if file_path != PREFERENCES_FILE else {}

def save_json_data(file_path: Path, data: Any) -> None:
    """Save data to JSON file"""  
    file_path.write_text(json.dumps(data, default=str, indent=2))

# Initialize FastAPI app
app = FastAPI(
    title="Launcher API",
    description="Backend API for sophisticated launcher interface",
    version="1.0.0"
)

# CORS middleware
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
if PRODUCTION:
    cors_origins = [origin.strip() for origin in cors_origins if origin.strip() != "*"]
    if not cors_origins:
        cors_origins = ["https://your-netlify-app.netlify.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# === Pydantic Models ===

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SimplePasswordLogin(BaseModel):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    user_id: str
    email: str
    full_name: str
    created_at: datetime
    is_active: bool = True

class LauncherApp(BaseModel):
    app_id: str
    name: str
    description: str
    icon_url: Optional[str] = None
    launch_url: str
    category: str
    user_id: str
    created_at: datetime
    is_active: bool = True

class LauncherAppCreate(BaseModel):
    name: str
    description: str
    icon_url: Optional[str] = None
    launch_url: str
    category: str

class LauncherInfo(BaseModel):
    user_id: str
    preferences: Dict[str, Any]
    apps: List[LauncherApp]
    last_updated: datetime

# === Database Functions ===

def get_users_data() -> List[Dict[str, Any]]:
    """Get users data from JSON file"""
    return load_json_data(USERS_FILE)

def save_users_data(users: List[Dict[str, Any]]) -> None:
    """Save users data to JSON file"""
    save_json_data(USERS_FILE, users)

def get_apps_data() -> List[Dict[str, Any]]:
    """Get apps data from JSON file"""
    return load_json_data(APPS_FILE)

def save_apps_data(apps: List[Dict[str, Any]]) -> None:
    """Save apps data to JSON file"""
    save_json_data(APPS_FILE, apps)

def get_preferences_data() -> Dict[str, Any]:
    """Get preferences data from JSON file"""
    return load_json_data(PREFERENCES_FILE)

def save_preferences_data(preferences: Dict[str, Any]) -> None:
    """Save preferences data to JSON file"""
    save_json_data(PREFERENCES_FILE, preferences)

# === Authentication Functions ===

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user - SYNC VERSION"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Find user in JSON data
    users_data = get_users_data()
    user = None
    for u in users_data:
        if u.get("user_id") == user_id:
            user = u
            break
    
    if user is None:
        raise credentials_exception
    
    return User(**user)

# === API Endpoints ===

@app.get("/")
def root():
    """Root endpoint"""
    return {"message": "Launcher API is running", "version": "1.0.0", "storage": "json_files"}

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "storage": "json_files",
        "production": PRODUCTION
    }

@app.post("/api/auth/register", response_model=Token)
def register_user(user_data: UserCreate):
    """Register a new user"""
    users_data = get_users_data()
    
    # Check if user already exists
    existing_user = None
    for user in users_data:
        if user.get("email") == user_data.email:
            existing_user = user
            break
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
        "is_active": True
    }
    
    users_data.append(user_doc)
    save_users_data(users_data)
    
    # Create access token
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
def login_user(user_data: UserLogin):
    """Login user"""
    users_data = get_users_data()
    
    # Find user
    user = None
    for u in users_data:
        if u.get("email") == user_data.email:
            user = u
            break
    
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["user_id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/simple-login", response_model=Token)
def simple_password_login(password_data: SimplePasswordLogin):
    """Simple password-only login (No signup required)"""
    master_password = os.getenv("MASTER_PASSWORD", "admin123")
    
    if password_data.password != master_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token for master user
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": "master_user"}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=User)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.get("/api/launcher-info")
def get_launcher_info(current_user: User = Depends(get_current_user)):
    """Get launcher information for current user"""
    apps_data = get_apps_data()
    preferences_data = get_preferences_data()
    
    # Get user's apps
    user_apps = []
    for app in apps_data:
        if app.get("user_id") == current_user.user_id and app.get("is_active", True):
            if isinstance(app.get("created_at"), str):
                app["created_at"] = datetime.fromisoformat(app["created_at"])
            user_apps.append(LauncherApp(**app))
    
    # Get user preferences
    user_preferences = preferences_data.get(current_user.user_id)
    if not user_preferences:
        user_preferences = {
            "user_id": current_user.user_id,
            "preferences": {
                "theme": "dark",
                "gesture_sensitivity": "medium",
                "animation_speed": "normal"
            },
            "last_updated": datetime.utcnow().isoformat()
        }
        preferences_data[current_user.user_id] = user_preferences
        save_preferences_data(preferences_data)
    
    last_updated = user_preferences["last_updated"]
    if isinstance(last_updated, str):
        last_updated = datetime.fromisoformat(last_updated)
    
    return LauncherInfo(
        user_id=current_user.user_id,
        preferences=user_preferences["preferences"],
        apps=user_apps,
        last_updated=last_updated
    )

@app.post("/api/launcher-apps", response_model=LauncherApp)
def create_launcher_app(
    app_data: LauncherAppCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new launcher app"""
    apps_data = get_apps_data()
    
    app_id = str(uuid.uuid4())
    app_doc = {
        "app_id": app_id,
        "user_id": current_user.user_id,
        "name": app_data.name,
        "description": app_data.description,
        "icon_url": app_data.icon_url,
        "launch_url": app_data.launch_url,
        "category": app_data.category,
        "created_at": datetime.utcnow().isoformat(),
        "is_active": True
    }
    
    apps_data.append(app_doc)
    save_apps_data(apps_data)
    
    app_doc["created_at"] = datetime.fromisoformat(app_doc["created_at"])
    
    return LauncherApp(**app_doc)

@app.get("/api/launcher-apps", response_model=List[LauncherApp])
def get_launcher_apps(current_user: User = Depends(get_current_user)):
    """Get all launcher apps for current user"""
    apps_data = get_apps_data()
    
    user_apps = []
    for app in apps_data:
        if app.get("user_id") == current_user.user_id and app.get("is_active", True):
            if isinstance(app.get("created_at"), str):
                app["created_at"] = datetime.fromisoformat(app["created_at"])
            user_apps.append(LauncherApp(**app))
    
    return user_apps

@app.put("/api/launcher-apps/{app_id}", response_model=LauncherApp)
def update_launcher_app(
    app_id: str,
    app_data: LauncherAppCreate,
    current_user: User = Depends(get_current_user)
):
    """Update a launcher app"""
    apps_data = get_apps_data()
    
    existing_app = None
    app_index = -1
    for i, app in enumerate(apps_data):
        if app.get("app_id") == app_id and app.get("user_id") == current_user.user_id:
            existing_app = app
            app_index = i
            break
    
    if not existing_app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="App not found"
        )
    
    apps_data[app_index].update({
        "name": app_data.name,
        "description": app_data.description,
        "icon_url": app_data.icon_url,
        "launch_url": app_data.launch_url,
        "category": app_data.category,
        "last_updated": datetime.utcnow().isoformat()
    })
    
    save_apps_data(apps_data)
    
    updated_app = apps_data[app_index].copy()
    if isinstance(updated_app.get("created_at"), str):
        updated_app["created_at"] = datetime.fromisoformat(updated_app["created_at"])
    
    return LauncherApp(**updated_app)

@app.delete("/api/launcher-apps/{app_id}")
def delete_launcher_app(
    app_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a launcher app"""
    apps_data = get_apps_data()
    
    app_found = False
    for app in apps_data:
        if app.get("app_id") == app_id and app.get("user_id") == current_user.user_id:
            app["is_active"] = False
            app_found = True
            break
    
    if not app_found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="App not found"
        )
    
    save_apps_data(apps_data)
    return {"message": "App deleted successfully"}

@app.put("/api/user/preferences")
def update_user_preferences(
    preferences_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Update user preferences"""
    preferences = get_preferences_data()
    
    preferences[current_user.user_id] = {
        "user_id": current_user.user_id,
        "preferences": preferences_data,
        "last_updated": datetime.utcnow().isoformat()
    }
    
    save_preferences_data(preferences)
    return {"message": "Preferences updated successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)