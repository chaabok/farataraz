const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Parsa ERP Unified Server
 * Starts Next.js frontend immediately on port 3000 (so the container health check passes instantly),
 * and compiles & starts the NestJS backend in parallel on port 3005.
 * Automatically clears stale port listeners and restarts crashed services.
 */

function killPort(port) {
  try {
    const { execSync } = require('child_process');
    execSync(`fuser -k ${port}/tcp 2>/dev/null || true`);
    execSync(`npx kill-port ${port} 2>/dev/null || true`);
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`);
    const output = execSync(`ss -tulpn 2>/dev/null | grep :${port} || true`).toString();
    const matches = output.match(/pid=(\d+)/g);
    if (matches) {
      matches.forEach(m => {
        const pid = parseInt(m.replace('pid=', ''), 10);
        if (pid && pid !== process.pid) {
          console.log(`[SERVER] Reclaiming port ${port} by terminating stale process ${pid}...`);
          try { process.kill(pid, 'SIGKILL'); } catch (e) {}
        }
      });
    }
  } catch (e) {}
}

/**
 * Parse the project .env file so child processes get the ERP's own database
 * and security settings. The sandbox platform injects its own DATABASE_URL
 * (e.g. file:...custom.db for a SQLite template) into the parent environment;
 * the .env values MUST win for the Parsa ERP backend/frontend.
 */
function loadEnvFile(currentDir) {
  try {
    const envPath = path.join(currentDir, '.env');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf-8');
    const vars = {};
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      if (key) vars[key] = val;
    });
    return vars;
  } catch (e) {
    return {};
  }
}

const ENV_OVERRIDE_KEYS = [
  'DATABASE_URL', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE',
  'JWT_SECRET', 'BACKEND_PORT', 'CORS_ORIGINS', 'GEMINI_API_KEY', 'OPENAI_API_KEY', 'DEEPSEEK_API_KEY',
  'NODE_ENV', 'DB_SYNCHRONIZE', 'BOOTSTRAP_DDL', 'FRONTEND_PUBLIC_DIR', 'FRONTEND_ROOT',
  'LICENSE_PUBLIC_KEY', 'LICENSE_ENFORCEMENT'
];

/**
 * Single-instance guard: the platform occasionally runs start.sh twice during
 * boot, which used to leave TWO unified servers fighting over port 3005 —
 * each instance's killPort(3005)/restart loop killed the other's backend
 * every few seconds (endless crash-loop) so ALL frontend API calls
 * (e.g. the customer-group dropdown) failed intermittently with empty lists.
 * A lockfile makes any duplicate instance exit immediately.
 */
function isAliveServerProcess(pid) {
  try {
    process.kill(pid, 0); // throws if the process does not exist
    const cmd = fs.readFileSync(`/proc/${pid}/cmdline`, 'utf-8');
    return cmd.includes('server.js'); // guards against pid reuse after reboot
  } catch (e) {
    return false;
  }
}

function acquireServerLock(dir) {
  const lockPath = path.join(dir, '.zscripts', 'server.lock');
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fd = fs.openSync(lockPath, 'wx'); // exclusive create — atomic
      fs.writeSync(fd, String(process.pid));
      fs.closeSync(fd);
      return { owned: true, lockPath };
    } catch (e) {
      if (e && e.code === 'EEXIST') {
        let lockPid = 0;
        try { lockPid = parseInt(fs.readFileSync(lockPath, 'utf-8').trim(), 10) || 0; } catch (_) {}
        if (lockPid && lockPid !== process.pid && isAliveServerProcess(lockPid)) {
          console.log(`[SERVER] Another unified server (pid ${lockPid}) is already running — exiting this duplicate instance.`);
          return { owned: false, lockPath };
        }
        // Stale lock from a dead/previous-boot instance — take over.
        console.log(`[SERVER] Removing stale server lock (pid ${lockPid || 'unknown'} is gone).`);
        try { fs.unlinkSync(lockPath); } catch (_) {}
        continue;
      }
      return { owned: true, lockPath }; // lock trouble must never block startup
    }
  }
  return { owned: true, lockPath };
}

async function main() {
  console.log('Starting Parsa ERP Unified Server...');

  const currentDir = process.cwd();
  const lock = acquireServerLock(currentDir);
  if (!lock.owned) process.exit(0);
  const envFile = loadEnvFile(currentDir);
  const envOverrides = {};
  for (const key of ENV_OVERRIDE_KEYS) {
    if (envFile[key] !== undefined && envFile[key] !== '') envOverrides[key] = envFile[key];
  }

  const backendEnv = {
    ...process.env,
    ...envOverrides,
    PORT: process.env.BACKEND_PORT || envOverrides.BACKEND_PORT || '3005',
    BACKEND_PORT: process.env.BACKEND_PORT || envOverrides.BACKEND_PORT || '3005'
  };

  const frontendEnv = {
    ...process.env,
    ...envOverrides,
    PORT: '3000',
    HOSTNAME: '0.0.0.0',
    // Task 83: در این محیط limit اعداد inotify (max_user_watches=8192) بسیار پایین است؛
    // watcher توربوپک بعد از مدتی می‌میرد و خروجی کهنه سرو می‌شود. حالت webpack با
    // polling (chokidar/watchpack) پایدار است و تغییرات فایل‌ها را همیشه تشخیص می‌دهد.
    CHOKIDAR_USEPOLLING: 'true',
    CHOKIDAR_INTERVAL: '1500',
    WATCHPACK_POLLING_INTERVAL: '1500'
  };

  // Reclaim ports before spawning
  killPort(3000);
  killPort(3005);

  // Task 84: در این sandbox پروسه next dev گاهی حتی با کد ۰ خارج می‌شود (OOM/نوسان محیط)
  // و frontend دیگر بالا نمی‌آمد. پرچم shuttingDown باعث می‌شود فقط هنگام خاموشی عمدی
  // ری‌استارت نشود و در هر خروج دیگر (حتی کد ۰) سرویس دوباره بالا بیاید.
  let shuttingDown = false;

  // 1. Start Next.js Frontend
  let frontend = null;
  const isProd = process.env.NODE_ENV === 'production';
  const nextBin = path.join(currentDir, 'node_modules', '.bin', 'next');
  const nextExec = fs.existsSync(nextBin) ? nextBin : 'npx';
  const nextArgs = fs.existsSync(nextBin) 
    ? (isProd ? ['start', '-H', '0.0.0.0', '-p', '3000'] : ['dev', '-H', '0.0.0.0', '-p', '3000'])
    : ['next', isProd ? 'start' : 'dev', '-H', '0.0.0.0', '-p', '3000'];

  const startFrontendProcess = () => {
    killPort(3000);
    console.log(`Spawning Next.js Frontend on port 3000 in ${isProd ? 'production' : 'development'} mode...`);
    frontend = spawn(nextExec, nextArgs, {
      stdio: 'inherit',
      env: frontendEnv,
      cwd: currentDir
    });

    frontend.on('exit', (code) => {
      console.log(`Frontend process exited with code ${code}`);
      if (!shuttingDown) {
        console.log('Restarting Next.js frontend in 3 seconds...');
        setTimeout(startFrontendProcess, 3000);
      }
    });
  };

  startFrontendProcess();

  // 2. Compile and Start NestJS Backend in background
  let backend = null;

  const startBackendProcess = () => {
    if (!fs.existsSync(path.join(currentDir, 'backend', 'dist', 'main.js'))) {
      console.warn('Backend dist/main.js not found yet, recompiling...');
      runBackendBuildAndStart();
      return;
    }
    killPort(3005);
    try {
      const { execSync } = require('child_process');
      const check = execSync(`nc -z 127.0.0.1 3005 && echo "in-use" || echo "free"`).toString();
      if (check.includes('in-use')) {
        console.log('Port 3005 is still in use, waiting 2 seconds before retry...');
        setTimeout(startBackendProcess, 2000);
        return;
      }
    } catch (e) {}

    console.log('Spawning NestJS Backend on port 3005...');
    backend = spawn('node', ['backend/dist/main.js'], {
      stdio: 'inherit',
      env: backendEnv,
      cwd: currentDir
    });

    backend.on('exit', (code) => {
      console.log(`NestJS Backend process exited with code ${code}`);
      if (!shuttingDown) {
        console.log('Restarting NestJS backend in 3 seconds...');
        setTimeout(startBackendProcess, 3000);
      }
    });
  };

  const runBackendBuildAndStart = () => {
    console.log('Compiling NestJS backend (async)...');
    const tscScript = path.join(currentDir, 'node_modules', 'typescript', 'bin', 'tsc');
    const tscExec = fs.existsSync(tscScript) ? 'node' : 'npx';
    const tscArgs = fs.existsSync(tscScript) ? [tscScript, '--project', 'backend/tsconfig.json'] : ['--yes', 'typescript', 'bin/tsc', '--project', 'backend/tsconfig.json'];

    const buildProc = spawn(tscExec, tscArgs, {
      stdio: 'inherit',
      cwd: currentDir
    });

    buildProc.on('exit', (code) => {
      if (code === 0) {
        console.log('NestJS backend compiled successfully.');
      } else {
        console.warn('Backend compilation warning/error code:', code);
      }
      startBackendProcess();
    });
  };

  // Always compile NestJS backend on start to serve updated code
  runBackendBuildAndStart();

  const cleanup = () => {
    console.log('Shutting down servers...');
    shuttingDown = true;
    try { if (backend) backend.kill(); } catch (e) {}
    try { if (frontend) frontend.kill(); } catch (e) {}
    // Release the single-instance lock so the next boot starts instantly.
    try {
      const lockPid = parseInt(fs.readFileSync(lock.lockPath, 'utf-8').trim(), 10);
      if (lockPid === process.pid) fs.unlinkSync(lock.lockPath);
    } catch (e) {}
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch(err => {
  console.error('Failed to start unified server:', err);
  process.exit(1);
});
