import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

declare module '@remix-run/node' {
  // or cloudflare, deno, etc.
  interface Future {
    v3_singleFetch: true;
  }
}

installGlobals();

export default defineConfig({
  optimizeDeps: {
    include: ['dompurify'],
    exclude: ['postgres', 'pg', 'bcrypt-ts', 'dotenv'],
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
      },
      // routes(defineRoutes) {
      //   return defineRoutes((route) => {
      //     route(
      //       "dashboard",
      //       "routes/_templatedashboard.dashboard/dashboard/Dashboard.tsx"
      //     ),
      //       // Dashboard index route
      //       route(
      //         "dashboard/jobs",
      //         "routes/_templatedashboard.dashboard/jobs/JobsList.tsx"
      //       );

      //     route(
      //       "dashboard/jobs:jobId",
      //       "routes/_templatedashboard.dashboard/jobs/JobDetails.tsx"
      //     );
      //     route(
      //       "dashboard/jobs/new",
      //       "routes/_templatedashboard.dashboard/jobs/NewJob.tsx"
      //     );
      //   });
      // },
    }),
    tsconfigPaths({ root: '../..' }),
  ],
  build: {
    rollupOptions: {
      external: ['postgres'],
    },
  },
  ssr: {
    noExternal: [/@mawaheb\/db/],
  },
  resolve: {
    alias: {
      '@mawaheb/db': resolve(__dirname, '../../packages/db/src'),
    },
  },
  // server: {
  //   host: "0.0.0.0",
  //   port: 3000,
  // },
});
