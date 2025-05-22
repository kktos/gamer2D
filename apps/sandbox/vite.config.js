import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"development"'
  },
  	resolve: {
    alias: {
      'gamer2d': path.resolve(__dirname, '../../packages/gamer2d/src'),
    },
  },
  


});