"""
WSGI Configuration for PythonAnywhere Deployment
This file is used by PythonAnywhere to serve the FastAPI application
"""

import sys
import os
from pathlib import Path

# Add the project directory to Python path
project_home = '/home/yourusername/mysite/backend'  # Update with your PythonAnywhere path
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables for production
os.environ.setdefault('PRODUCTION', 'true')

# Import the FastAPI app
from server import app

# WSGI application
application = app