import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Parsa ERP Unified Server
 * Spawns Next.js frontend on port 3000 immediately, and NestJS backend on port 3005.
 */

function killPort(port: number): void {
  try {
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

async function main() {
  console.log('Starting Parsa ERP Unified Server...');

  const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

  const backendEnv = { 
    ...process.env, 
    PORT: process.env.BACKEND_PORT || '3005',
    BACKEND_PORT: process.env.BACKEND_PORT || '3005'
  };

  const frontendEnv = {
    ...process.env,
    PORT: '3000',
    HOSTNAME: '0.0.0.0'
  };

  // Reclaim ports before spawning
  killPort(3000);
  killPort(3005);

  // 1. Start Next.js Frontend FIRST on port 3000 so applet preview is responsive immediately
  const isProd = process.env.NODE_ENV === 'production';
  const nextBin = path.join(currentDir, 'node_modules', '.bin', 'next');
  const nextExec = fs.existsSync(nextBin) ? nextBin : 'npx';
  const nextArgs = fs.existsSync(nextBin) 
    ? (isProd ? ['start', '-H', '0.0.0.0', '-p', '3000'] : ['dev', '--turbo', '-H', '0.0.0.0', '-p', '3000'])
    : ['next', isProd ? 'start' : 'dev', '-H', '0.0.0.0', '-p', '3000'];

  console.log(`Spawning Next.js Frontend on port 3000 in ${isProd ? 'production' : 'development'} mode...`);
  const frontend = spawn(nextExec, nextArgs, {
    stdio: 'inherit',
    env: frontendEnv,
    cwd: currentDir
  });

  frontend.on('exit', (code: number | null) => {
    console.log(`Frontend process exited with code ${code}`);
  });

  // 2. Build & Start NestJS Backend on port 3005 asynchronously
  const backendMainJs = path.join(currentDir, 'backend', 'dist', 'main.js');
  const backendDir = path.join(currentDir, 'backend');

  let backendProc: any = null;

  const startBackendProcess = () => {
    if (fs.existsSync(backendMainJs)) {
      if (backendProc) {
        try { backendProc.kill('SIGTERM'); } catch (e) {}
      }
      killPort(3005);
      console.log('Spawning NestJS Backend on port 3005...');
      backendProc = spawn('node', ['backend/dist/main.js'], {
        stdio: 'inherit',
        env: backendEnv,
        cwd: currentDir
      });

      backendProc.on('exit', (code: number | null) => {
        console.log(`Backend process exited with code ${code}`);
      });
    }
  };

  // If backend dist exists, start it immediately
  if (fs.existsSync(backendMainJs)) {
    startBackendProcess();
  }

  // Compile NestJS in background non-blocking
  const tscBin = path.join(currentDir, 'node_modules', '.bin', 'tsc');
  const tscCmd = fs.existsSync(tscBin) ? tscBin : 'npx';
  const tscArgs = fs.existsSync(tscBin) ? ['--project', 'backend/tsconfig.json'] : ['tsc', '--project', 'backend/tsconfig.json'];

  const tscProc = spawn(tscCmd, tscArgs, {
    stdio: 'inherit',
    cwd: currentDir
  });

  tscProc.on('exit', (code) => {
    if (code === 0) {
      console.log('NestJS backend compiled successfully.');
      startBackendProcess();
    } else {
      console.error(`NestJS compilation exited with code ${code}`);
      if (fs.existsSync(backendMainJs)) {
        startBackendProcess();
      }
    }
  });
}

main().catch(err => {
  console.error('Fatal error in server.ts:', err);
});
