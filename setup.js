const fs = require('fs');
const path = require('path');

// API structure definition
const apiStructure = {
  'text-simplifier-api': {
    'src': {
      'controllers': {
        'simplifyController.js': '',
        'utils.js': ''
      },
      'routes': {
        'index.js': ''
      },
      'middleware': {
        'errorHandler.js': '',
        'rateLimiter.js': ''
      },
      'config': {
        'index.js': ''
      },
      'index.js': ''
    },
    'tests': {
      'controllers': {
        'simplifyController.test.js': ''
      },
      'utils': {
        'utils.test.js': ''
      }
    },
    'package.json': '',
    '.env': '',
    '.env.example': '',
    'vercel.json': '',
    '.gitignore': '',
    'README.md': ''
  }
};

// Function to create directory structure
function createDirectoryStructure(basePath, structure) {
  for (const [name, content] of Object.entries(structure)) {
    const currentPath = path.join(basePath, name);
    
    if (typeof content === 'object') {
      // Create directory
      fs.mkdirSync(currentPath, { recursive: true });
      createDirectoryStructure(currentPath, content);
    } else {
      // Create empty file
      fs.writeFileSync(currentPath, '');
    }
  }
}

// Create project directory
const basePath = process.cwd();
console.log('Creating API structure...');
createDirectoryStructure(basePath, apiStructure);

console.log('API structure created successfully!');