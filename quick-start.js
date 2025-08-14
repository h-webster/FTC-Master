const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting FTC Visualizer...\n');

// Start backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit();
});

backend.on('error', (err) => {
  console.error('Backend error:', err);
});

frontend.on('error', (err) => {
  console.error('Frontend error:', err);
}); 