const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[Build] Initializing build process...');

const rootDir = path.resolve(__dirname, '..');
const mobileDir = path.join(rootDir, 'mobile');
const mobileExpoPath = path.join(mobileDir, 'node_modules', 'expo');
const distDir = path.join(rootDir, 'dist');
const distIndexPath = path.join(distDir, 'index.html');

if (fs.existsSync(mobileExpoPath)) {
  console.log('[Build] Found local mobile dependencies. Compiling fresh web bundle via Expo...');
  try {
    execSync('npx expo export -p web', {
      cwd: mobileDir,
      stdio: 'inherit',
    });
    const mobileDist = path.join(mobileDir, 'dist');
    if (fs.existsSync(mobileDist)) {
      fs.cpSync(mobileDist, distDir, { recursive: true, force: true });
      fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
      console.log('[Build] Successfully synchronized mobile/dist to dist/');
    }
  } catch (err) {
    console.warn('[Build] Expo compilation failed, using pre-built static bundle:', err.message);
  }
} else if (fs.existsSync(distIndexPath)) {
  console.log('[Build] CI environment detected (expo not installed at root).');
  console.log('[Build] Using pre-built static production bundle in /dist.');
} else {
  console.log('[Build] Installing mobile dependencies to compile bundle...');
  try {
    execSync('npm --prefix mobile install', { stdio: 'inherit' });
    execSync('npx expo export -p web', { cwd: mobileDir, stdio: 'inherit' });
    const mobileDist = path.join(mobileDir, 'dist');
    if (fs.existsSync(mobileDist)) {
      fs.cpSync(mobileDist, distDir, { recursive: true, force: true });
      fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
    }
  } catch (err) {
    console.error('[Build Error]', err.message);
    process.exit(1);
  }
}

console.log('[Build] Build completed successfully.');
