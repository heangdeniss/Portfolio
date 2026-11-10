import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vaultAssets from './scripts/vault-assets.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vaultAssets()],
})
