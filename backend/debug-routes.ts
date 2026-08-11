import express from 'express';
import localStoreRoutes from './src/routes/localStoreRoutes.js';

const app = express();
app.use('/api/local-stores', localStoreRoutes);

console.log('Routes in /api/local-stores:');
localStoreRoutes.stack.forEach((r: any) => {
  if (r.route) {
    console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
  }
});

const serverStack = app._router.stack;
console.log('\nApp Stack:');
serverStack.forEach((r: any) => {
  if (r.route) {
    console.log(`Route: ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
  } else if (r.name === 'router') {
    console.log(`Router: ${r.regexp}`);
  }
});
