/* IMPORT SECTION */
// import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LauncherScreen from "./Core/Launcher/LauncherScreen";
// import LoginForm from "./components/Auth/LoginForm.jsx";
// import SimplePasswordForm from "./components/Auth/SimplePasswordForm.jsx";

/* MAIN APP COMPONENT - Authentication Disabled */
export default function App() {
  // Authentication temporarily disabled - directly show launcher
  return <LauncherScreen />;
}

/* 
// ============================================================================
// AUTHENTICATION OPTIONS (CHOOSE ONE - CURRENTLY ALL DISABLED)
// ============================================================================

// OPTION 1: SIMPLE PASSWORD-ONLY AUTHENTICATION
// - Set password in /app/backend/.env: MASTER_PASSWORD=your-password-here
// - Enable backend endpoint: Uncomment @app.post("/api/auth/simple-login") in server.py
// - No signup required, just one master password

function SimpleAuthApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <LauncherScreen /> : <SimplePasswordForm />;
}

export default function App() {
  return (
    <AuthProvider>
      <SimpleAuthApp />
    </AuthProvider>
  );
}

// ============================================================================

// OPTION 2: FULL AUTHENTICATION (EMAIL + PASSWORD + SIGNUP)
// - Complete user management system
// - Users can register and login with email/password

function FullAuthApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <LauncherScreen /> : <LoginForm />;
}

export default function App() {
  return (
    <AuthProvider>
      <FullAuthApp />
    </AuthProvider>
  );
}

// ============================================================================
// TO ENABLE AUTHENTICATION:
// 1. Choose Option 1 (Simple) or Option 2 (Full) above
// 2. Replace the current export default App() with your chosen option
// 3. For Simple Auth: Also uncomment the backend endpoint in server.py
// ============================================================================
*/