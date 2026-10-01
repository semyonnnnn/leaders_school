import { defineConfig, loadEnv } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Function form, so we get `mode` and can load .env before building the config
export default defineConfig(({ mode }) => {
  // Third argument '' = load ALL variables from .env, not only VITE_* ones.
  // VITE_PORT is already VITE_-prefixed, but this keeps it working if it's renamed.
  const env = loadEnv(mode, process.cwd(), '')

  // Number(): .env values are always strings, and Vite's port must be a number
  const vitePort = Number(env.VITE_PORT)

  return {
    plugins: [
      laravel({
        input: ['resources/css/app.css', 'resources/js/app.jsx'], // Ensure this matches your actual file structure
        refresh: true,
      }),
      react(),
      tailwindcss(),
    ],
    server: {
      host: '0.0.0.0',
      // Must equal the port in compose.yaml ('${VITE_PORT}:${VITE_PORT}'),
      // otherwise the browser reaches a port nothing listens on
      port: vitePort,
      hmr: {
        host: '10.166.20.85',
        // Port the browser connects to for hot reload: the published (outside) port
        port: vitePort,
      },
      watch: {
        usePolling: true,
      },
    },
    define: {
      __BUNDLED_DEV__: JSON.stringify(true),
      __SERVER_FORWARD_CONSOLE__: JSON.stringify(false),
      __NODE__: JSON.stringify(false),
    },
  }
})