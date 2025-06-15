import { defineConfig } from 'tsdown';

export default defineConfig({
  // entry: 'src/game/Game.ts',
  entry: 'src/**/*.ts',
  dts: true,
  target: "es2020",
  platform: "browser",
  exports: true,
  clean: true,
  unbundle: true
})