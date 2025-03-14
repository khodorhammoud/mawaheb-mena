// vite.config.ts
import { vitePlugin as remix } from "file:///C:/Users/user/Desktop/work/GIG%20Platform/code/mawaheb-mena/node_modules/@remix-run/dev/dist/index.js";
import { defineConfig } from "file:///C:/Users/user/Desktop/work/GIG%20Platform/code/mawaheb-mena/apps/frontend/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///C:/Users/user/Desktop/work/GIG%20Platform/code/mawaheb-mena/node_modules/vite-tsconfig-paths/dist/index.js";
var vite_config_default = defineConfig({
  optimizeDeps: {
    include: ["dompurify"]
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true
      }
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
    tsconfigPaths()
  ],
  server: {
    host: "0.0.0.0",
    port: 3e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcd29ya1xcXFxHSUcgUGxhdGZvcm1cXFxcY29kZVxcXFxtYXdhaGViLW1lbmFcXFxcYXBwc1xcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXHdvcmtcXFxcR0lHIFBsYXRmb3JtXFxcXGNvZGVcXFxcbWF3YWhlYi1tZW5hXFxcXGFwcHNcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvRGVza3RvcC93b3JrL0dJRyUyMFBsYXRmb3JtL2NvZGUvbWF3YWhlYi1tZW5hL2FwcHMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSBcIkByZW1peC1ydW4vZGV2XCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XHJcblxyXG5kZWNsYXJlIG1vZHVsZSBcIkByZW1peC1ydW4vbm9kZVwiIHtcclxuICAvLyBvciBjbG91ZGZsYXJlLCBkZW5vLCBldGMuXHJcbiAgaW50ZXJmYWNlIEZ1dHVyZSB7XHJcbiAgICB2M19zaW5nbGVGZXRjaDogdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbXCJkb21wdXJpZnlcIl0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZW1peCh7XHJcbiAgICAgIGZ1dHVyZToge1xyXG4gICAgICAgIHYzX2ZldGNoZXJQZXJzaXN0OiB0cnVlLFxyXG4gICAgICAgIHYzX3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlLFxyXG4gICAgICAgIHYzX3Rocm93QWJvcnRSZWFzb246IHRydWUsXHJcbiAgICAgICAgdjNfbGF6eVJvdXRlRGlzY292ZXJ5OiB0cnVlLFxyXG4gICAgICAgIHYzX3NpbmdsZUZldGNoOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgICAvLyByb3V0ZXMoZGVmaW5lUm91dGVzKSB7XHJcbiAgICAgIC8vICAgcmV0dXJuIGRlZmluZVJvdXRlcygocm91dGUpID0+IHtcclxuICAgICAgLy8gICAgIHJvdXRlKFxyXG4gICAgICAvLyAgICAgICBcImRhc2hib2FyZFwiLFxyXG4gICAgICAvLyAgICAgICBcInJvdXRlcy9fdGVtcGxhdGVkYXNoYm9hcmQuZGFzaGJvYXJkL2Rhc2hib2FyZC9EYXNoYm9hcmQudHN4XCJcclxuICAgICAgLy8gICAgICksXHJcbiAgICAgIC8vICAgICAgIC8vIERhc2hib2FyZCBpbmRleCByb3V0ZVxyXG4gICAgICAvLyAgICAgICByb3V0ZShcclxuICAgICAgLy8gICAgICAgICBcImRhc2hib2FyZC9qb2JzXCIsXHJcbiAgICAgIC8vICAgICAgICAgXCJyb3V0ZXMvX3RlbXBsYXRlZGFzaGJvYXJkLmRhc2hib2FyZC9qb2JzL0pvYnNMaXN0LnRzeFwiXHJcbiAgICAgIC8vICAgICAgICk7XHJcblxyXG4gICAgICAvLyAgICAgcm91dGUoXHJcbiAgICAgIC8vICAgICAgIFwiZGFzaGJvYXJkL2pvYnM6am9iSWRcIixcclxuICAgICAgLy8gICAgICAgXCJyb3V0ZXMvX3RlbXBsYXRlZGFzaGJvYXJkLmRhc2hib2FyZC9qb2JzL0pvYkRldGFpbHMudHN4XCJcclxuICAgICAgLy8gICAgICk7XHJcbiAgICAgIC8vICAgICByb3V0ZShcclxuICAgICAgLy8gICAgICAgXCJkYXNoYm9hcmQvam9icy9uZXdcIixcclxuICAgICAgLy8gICAgICAgXCJyb3V0ZXMvX3RlbXBsYXRlZGFzaGJvYXJkLmRhc2hib2FyZC9qb2JzL05ld0pvYi50c3hcIlxyXG4gICAgICAvLyAgICAgKTtcclxuICAgICAgLy8gICB9KTtcclxuICAgICAgLy8gfSxcclxuICAgIH0pLFxyXG4gICAgdHNjb25maWdQYXRocygpLFxyXG4gIF0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjAuMC4wLjBcIixcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlosU0FBUyxjQUFjLGFBQWE7QUFDamMsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFTMUIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFdBQVc7QUFBQSxFQUN2QjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osUUFBUTtBQUFBLFFBQ04sbUJBQW1CO0FBQUEsUUFDbkIsc0JBQXNCO0FBQUEsUUFDdEIscUJBQXFCO0FBQUEsUUFDckIsdUJBQXVCO0FBQUEsUUFDdkIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQXVCRixDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
