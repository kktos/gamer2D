/*
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";

export default defineConfig({  // config options
  resolve: {
  alias: [
	{  find:"gamer2d" , replacement: fileURLToPath(new URL('../../packages/gamer2d', import.meta.url)) }],
},
});
*/
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"development"'
  }
  // server: {
  //   watch: {
  //     paths: ['./public/**/*'],
  //     usePolling: true,
  //   },
  // },

});