# Deployment and Process Control

This project uses **PM2** to manage both the Node.js frontend server and the Python FastAPI backend as background services.

## Process Control Audit

The `ecosystem.config.js` is optimized for local operations:
- `autorestart: true` ensures that services restart automatically if they crash.
- `watch: false` disables auto-restart on file changes to save resources (ideal for a stable local setup).
- Separate log files are tracked for easy debugging (`logs/out.log`, `logs/backend_out.log`, etc.).
- Explicit environment configurations point to the correct internal ports (3010 for frontend, 3011 for backend).

## Registering PM2 with systemctl (Auto-Start on Boot)

To ensure that both the backend and frontend restart automatically when the Linux machine reboots, you must register PM2 with systemd.

Run the following commands in your terminal:

```bash
# 1. Generate the startup script for your specific environment
pm2 startup systemd

# 2. **IMPORTANT**: The command above will output a specific command at the very end 
#    that you must copy and paste into your terminal. It will look something like:
#    sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u <username> --hp /home/<username>

# 3. Save the current PM2 process list (which includes tts-web-app and tts-api-backend)
pm2 save

# 4. (Optional) Verify that the pm2 service is enabled in systemctl
systemctl status pm2-<your-username>
```

By following these steps, your Neural Voice Studio applications will operate resiliently as native Linux daemon services.
