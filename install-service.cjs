const Service = require('node-windows').Service;

// Create a new service object
const svc = new Service({
  name: 'StudyAppBackend',
  description: 'Runs the backend server for My Study App',
  script: 'C:\\Users\\jemah\\Desktop\\cours 2025-2026\\my-study-app\\server\\server.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event
svc.on('install', function() {
  svc.start();
  console.log('✅ Study App backend installed and started as a Windows service.');
});

// Install the service
svc.install();
