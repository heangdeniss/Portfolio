import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vaultAssets from './scripts/vault-assets.js'
import seoPlugin from './scripts/generate-seo.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vaultAssets(), seoPlugin()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: 'vendor-motion',
              test: /node_modules[\\/](gsap|lenis)[\\/]/,
              priority: 20,
            },
            {
              name: 'vendor-three-core',
              test: /node_modules[\\/]three[\\/]build[\\/]three\.core\.js/,
              priority: 15,
            },
            {
              name: 'vendor-three-renderer',
              test: /node_modules[\\/]three[\\/]build[\\/]three\.module\.js/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
