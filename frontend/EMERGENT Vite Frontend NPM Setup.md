# AI Agent Instructions: Vite Frontend NPM Setup

## **ROLE AND CONTEXT**
You are a specialized AI agent responsible for fixing a **Vite-based React frontend application** that has supervisor configuration issues. The application uses **NPM as package manager** and serves a sophisticated launcher interface with gesture controls.

## **STRICT EXECUTION PROTOCOL**

### **⚠️ CRITICAL RULES - MUST FOLLOW EXACTLY**
1. **NEVER use Yarn commands** - this project uses NPM exclusively
2. **ALWAYS use `--` separator** when passing arguments to NPM scripts
3. **MUST verify each step** before proceeding to the next
4. **DO NOT skip dependency installation** - always run `npm install`
5. **MUST check logs** after each service restart
6. **DO NOT proceed** if any step fails - troubleshoot first

---

## **STEP 1: DEPENDENCY INSTALLATION (MANDATORY)**

```bash
# Execute these commands in exact order:
cd /app/frontend
rm -rf node_modules package-lock.json  # Clean slate
npm install
npm audit fix
```

**VERIFICATION REQUIRED:**
- ✅ Command output shows "added XXX packages"
- ✅ Command output shows "found 0 vulnerabilities"
- ✅ `package-lock.json` file exists
- ✅ NO `yarn.lock` file present

**IF VERIFICATION FAILS:** Retry installation, check for permission issues.

---

## **STEP 2: VITE CONFIGURATION UPDATE (MANDATORY)**

**Update `/app/frontend/vite.config.ts` with EXACT content:**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: [
      "vscode-149e08b4-de1c-42f0-b668-f7febd0031d1.preview.emergentagent.com",
      "dev-preview-95.preview.emergentagent.com"
    ]
  }
});
```

**VERIFICATION REQUIRED:**
- ✅ File contains EXACT content above
- ✅ `allowedHosts` array includes both domains
- ✅ `host: "0.0.0.0"` and `port: 3000` are set

---

## **STEP 3: SUPERVISOR CONFIGURATION (MANDATORY)**

**Execute these commands in EXACT order:**

```bash
# Remove old configuration
sudo rm /etc/supervisor/conf.d/supervisord.conf

# Create new NPM-based configuration
```

**Create `/etc/supervisor/conf.d/app.conf` with EXACT content:**

```ini
[program:frontend]
command=npm run dev -- --host 0.0.0.0 --port 3000
directory=/app/frontend
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/frontend.err.log
stdout_logfile=/var/log/supervisor/frontend.out.log
stopsignal=TERM
stopwaitsecs=50
stopasgroup=true
killasgroup=true

[program:mongodb]
command=/usr/bin/mongod --bind_ip_all
autostart=true
autorestart=true
stderr_logfile=/var/log/mongodb.err.log
stdout_logfile=/var/log/mongodb.out.log
```

**CRITICAL:** The command MUST be `npm run dev -- --host 0.0.0.0 --port 3000`
- Note the `--` separator before arguments
- This is different from Yarn syntax

---

## **STEP 4: SERVICE RESTART (MANDATORY)**

**Execute these commands and WAIT for each:**

```bash
# Reload supervisor configuration
sudo supervisorctl reload

# Wait for services to initialize
sleep 5

# Check service status
sudo supervisorctl status
```

**VERIFICATION REQUIRED:**
- ✅ Frontend service shows `RUNNING` status
- ✅ MongoDB service shows `RUNNING` status
- ✅ NO services show `FATAL` or `BACKOFF` status

**IF VERIFICATION FAILS:** Check logs immediately using Step 5.

---

## **STEP 5: LOG VERIFICATION (MANDATORY)**

**Check frontend logs:**

```bash
tail -n 10 /var/log/supervisor/frontend.out.log
```

**REQUIRED OUTPUT PATTERN:**
```
> new-mega-meng@0.0.0 dev
> vite --host 0.0.0.0 --port 3000

  VITE v7.1.4  ready in XXXms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://10.X.X.X:3000/
```

**ERROR LOG CHECK:**
```bash
tail -n 5 /var/log/supervisor/frontend.err.log
```

**MUST NOT contain recent errors** (ignore old "Command start not found" errors)

---

## **STEP 6: APPLICATION VERIFICATION (MANDATORY)**

**Use screenshot tool to verify application:**

```javascript
// Required test script - execute exactly as shown
try {
    await page.set_viewport_size({"width": 1920, "height": 800});
    await page.goto("https://dev-preview-95.preview.emergentagent.com");
    await page.wait_for_timeout(3000);
    
    // MUST verify these elements exist:
    const darkBg = await page.query_selector('div.bg-gray-900');
    const originDot = await page.query_selector('div[aria-label="origin marker"]');
    
    if (!darkBg || !originDot) {
        throw new Error("Application components not loading properly");
    }
    
    // Test triple-tap functionality
    for (let i = 0; i < 3; i++) {
        await page.mouse.click(960, 400);
        await page.wait_for_timeout(100);
    }
    await page.wait_for_timeout(1000);
    
    const launcherBtn = await page.query_selector('div:has-text("LauncherBtn")');
    if (!launcherBtn) {
        console.warn("LauncherBtn not visible - gesture may need adjustment");
    }
    
    console.log("✅ APPLICATION VERIFICATION SUCCESSFUL");
    
} catch (error) {
    console.error("❌ APPLICATION VERIFICATION FAILED:", error);
    throw error;
}
```

**SUCCESS CRITERIA:**
- ✅ Dark cosmic background visible
- ✅ Green origin dot in center
- ✅ No "host not allowed" errors
- ✅ Triple-tap gesture works (LauncherBtn appears)

---

## **TROUBLESHOOTING COMMANDS (USE IF STEPS FAIL)**

### **If NPM installation fails:**
```bash
cd /app/frontend
rm -rf node_modules package-lock.json ~/.npm
npm cache clean --force
npm install
```

### **If Vite server won't start:**
```bash
cd /app/frontend
npm run dev  # Test directly
# Check for port conflicts: lsof -i :3000
```

### **If supervisor services fail:**
```bash
sudo supervisorctl stop all
sudo supervisorctl start all
sudo supervisorctl status
```

### **If host not allowed error:**
```bash
# Verify vite.config.ts contains correct allowedHosts
# Add your specific preview domain to the allowedHosts array
```

---

## **COMPLETION CHECKLIST (ALL MUST BE ✅)**

**Service Status:**
- [ ] `sudo supervisorctl status` shows frontend `RUNNING`
- [ ] `sudo supervisorctl status` shows mongodb `RUNNING`
- [ ] No services in `FATAL` or `BACKOFF` state

**Logs Verification:**
- [ ] Frontend logs show "VITE v7.1.4 ready in XXXms"
- [ ] No recent errors in stderr logs
- [ ] Port 3000 accessible internally

**NPM Integration:**
- [ ] `package-lock.json` exists (NOT yarn.lock)
- [ ] `npm run dev -- --help` works when tested
- [ ] Dependencies installed with NPM

**Application Functionality:**
- [ ] Preview URL loads without errors
- [ ] Dark cosmic background displays
- [ ] Green origin dot visible in center
- [ ] Triple-tap gesture triggers LauncherBtn
- [ ] No console errors in browser

**Configuration Files:**
- [ ] `/app/frontend/vite.config.ts` contains correct allowedHosts
- [ ] `/etc/supervisor/conf.d/app.conf` uses NPM commands
- [ ] No conflicting supervisor configurations exist

---

## **FAILURE PROTOCOL**

**IF ANY STEP FAILS:**
1. **STOP immediately** - do not proceed to next step
2. **Check error logs** using troubleshooting commands
3. **Retry the failed step** after resolving issues
4. **Verify resolution** before continuing
5. **Document the issue** for future reference

**IF MULTIPLE RETRIES FAIL:**
1. **Report the specific error message**
2. **Include full log output**
3. **List which steps completed successfully**
4. **Request human intervention**

---

## **SUCCESS CONFIRMATION**

**ONLY report success when ALL of the following are confirmed:**
- ✅ All 6 steps completed without errors
- ✅ All items in completion checklist are verified
- ✅ Application loads and functions properly
- ✅ Screenshots show working launcher interface
- ✅ NPM commands work correctly

**Final confirmation command:**
```bash
echo "✅ NPM-based Vite React application successfully configured and running"
```

**REMEMBER:** This is a **frontend-only application** with no backend dependencies. The sophisticated launcher interface should display a cosmic background with interactive gesture controls.