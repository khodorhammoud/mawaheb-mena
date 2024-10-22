import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route(
            "dashboard",
            "routes/_templatedashboard.dashboard/dashboard/Dashboard.tsx"
          ),
            // Dashboard index route
            route(
              "dashboard/jobs",
              "routes/_templatedashboard.dashboard/jobs/JobsList.tsx"
            );

          route(
            "dashboard/jobs:jobId",
            "routes/_templatedashboard.dashboard/jobs/JobDetails.tsx"
          );
          route(
            "dashboard/jobs/new",
            "routes/_templatedashboard.dashboard/jobs/NewJob.tsx"
          );
        });
      },
    }),
    tsconfigPaths(),
  ],
});
