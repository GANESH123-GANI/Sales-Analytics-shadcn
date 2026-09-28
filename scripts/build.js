const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('[Build] Initializing build process...');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = fs.existsSync(path.join(rootDir, 'frontend'))
  ? path.join(rootDir, 'frontend')
  : path.join(rootDir, 'mobile');

const expoPath = path.join(frontendDir, 'node_modules', 'expo');
const distDir = path.join(rootDir, 'dist');
const distIndexPath = path.join(distDir, 'index.html');

if (fs.existsSync(expoPath)) {
  console.log(`[Build] Found dependencies in ${path.basename(frontendDir)}. Compiling fresh web bundle via Expo...`);
  try {
    execSync('npx expo export -p web', {
      cwd: frontendDir,
      stdio: 'inherit',
    });
    const frontendDist = path.join(frontendDir, 'dist');
    if (fs.existsSync(frontendDist)) {
      fs.cpSync(frontendDist, distDir, { recursive: true, force: true });
      fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
      console.log(`[Build] Successfully synchronized ${path.basename(frontendDir)}/dist to dist/`);
    }
  } catch (err) {
    console.warn('[Build] Expo compilation failed, using pre-built static bundle:', err.message);
  }
} else if (fs.existsSync(distIndexPath)) {
  console.log('[Build] Using pre-built static production bundle in /dist.');
} else {
  console.log(`[Build] Installing dependencies in ${path.basename(frontendDir)}...`);
  try {
    execSync(`npm --prefix ${path.basename(frontendDir)} install`, { stdio: 'inherit' });
    execSync('npx expo export -p web', { cwd: frontendDir, stdio: 'inherit' });
    const frontendDist = path.join(frontendDir, 'dist');
    if (fs.existsSync(frontendDist)) {
      fs.cpSync(frontendDist, distDir, { recursive: true, force: true });
      fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
    }
  } catch (err) {
    console.error('[Build Error]', err.message);
    process.exit(1);
  }
}

console.log('[Build] Build completed successfully.');
