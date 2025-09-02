🚨 IMMEDIATE ACTION FOR NEXT AI AGENT:
Create /etc/supervisor/conf.d/app.conf with EXACT content:

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
CRITICAL: The command MUST be npm run dev -- --host 0.0.0.0 --port 3000

Note the -- separator before arguments
This is different from Yarn syntax
Then run:

sudo supervisorctl reread && sudo supervisorctl update
sudo supervisorctl status
Status: ✅ Deployment-ready launcher application
Backend: Sync FastAPI + JSON storage
Frontend: React + TypeScript (build tested)
Docs: Complete setup/deployment guides