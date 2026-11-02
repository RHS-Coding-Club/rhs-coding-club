import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

/** Swaps GSAP for a stub in the Worker build; see src/lib/gsap-server-stub.ts. */
const GSAP_MODULE = /^(gsap(\/.*)?|@gsap\/react)$/
function stubGsapOnServer(): Plugin {
  return {
    name: 'stub-gsap-on-server',
    enforce: 'pre',
    applyToEnvironment: (environment) => environment.name === 'ssr',
    resolveId(id) {
      if (GSAP_MODULE.test(id))
        return fileURLToPath(new URL('./src/lib/gsap-server-stub.ts', import.meta.url))
    },
  }
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
  plugins: [
    stubGsapOnServer(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})
