// vite.config.ts
import { vitePlugin as remix } from "file:///C:/Users/user/Desktop/work/GIG%20Platform/code/mawaheb-mena/node_modules/.pnpm/@remix-run+dev@2.16.5_@remi_1fc6c872e4565109963620653b9e8816/node_modules/@remix-run/dev/dist/index.js";
import { installGlobals } from "file:///C:/Users/user/Desktop/work/GIG%20Platform/code/mawaheb-mena/node_modules/.pnpm/@remix-run+node@2.16.5_typescript@5.8.3/node_modules/@remix-run/node/dist/index.js";
import { defineConfig } from "file:///C:/Users/user/Desktop/work/GIG%20Platform/code/mawaheb-mena/node_modules/.pnpm/vite@5.4.19_@types+node@20.17.32_terser@5.39.0/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///C:/Users/user/Desktop/work/GIG%20Platform/code/mawaheb-mena/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_t_1945e468ad87c1e28a44e0c3739071a9/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\user\\Desktop\\work\\GIG Platform\\code\\mawaheb-mena\\apps\\frontend";
installGlobals({ nativeFetch: true });
var vite_config_default = defineConfig({
  optimizeDeps: {
    include: ["dompurify"],
    exclude: ["postgres", "pg", "bcrypt-ts", "dotenv"]
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
    tsconfigPaths({ root: "../.." })
  ],
  build: {
    rollupOptions: {
      external: ["postgres"]
    }
  },
  ssr: {
    noExternal: [/@mawaheb\/db/]
  },
  resolve: {
    alias: {
      "@mawaheb/db": resolve(__vite_injected_original_dirname, "../../packages/db/src")
    }
  }
  // server: {
  //   host: "0.0.0.0",
  //   port: 3000,
  // },
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXERlc2t0b3BcXFxcd29ya1xcXFxHSUcgUGxhdGZvcm1cXFxcY29kZVxcXFxtYXdhaGViLW1lbmFcXFxcYXBwc1xcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcdXNlclxcXFxEZXNrdG9wXFxcXHdvcmtcXFxcR0lHIFBsYXRmb3JtXFxcXGNvZGVcXFxcbWF3YWhlYi1tZW5hXFxcXGFwcHNcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3VzZXIvRGVza3RvcC93b3JrL0dJRyUyMFBsYXRmb3JtL2NvZGUvbWF3YWhlYi1tZW5hL2FwcHMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSAnQHJlbWl4LXJ1bi9kZXYnO1xyXG5pbXBvcnQgeyBpbnN0YWxsR2xvYmFscyB9IGZyb20gJ0ByZW1peC1ydW4vbm9kZSc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5cclxuZGVjbGFyZSBtb2R1bGUgJ0ByZW1peC1ydW4vbm9kZScge1xyXG4gIC8vIG9yIGNsb3VkZmxhcmUsIGRlbm8sIGV0Yy5cclxuICBpbnRlcmZhY2UgRnV0dXJlIHtcclxuICAgIHYzX3NpbmdsZUZldGNoOiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuLy8gVXNlIHRoZSBuYXRpdmUgZmV0Y2ggaW1wbGVtZW50YXRpb24gdG8gZW5zdXJlIFJlc3BvbnNlLmpzb24gaXMgYXZhaWxhYmxlXHJcbmluc3RhbGxHbG9iYWxzKHsgbmF0aXZlRmV0Y2g6IHRydWUgfSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogWydkb21wdXJpZnknXSxcclxuICAgIGV4Y2x1ZGU6IFsncG9zdGdyZXMnLCAncGcnLCAnYmNyeXB0LXRzJywgJ2RvdGVudiddLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVtaXgoe1xyXG4gICAgICBmdXR1cmU6IHtcclxuICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcclxuICAgICAgICB2M19yZWxhdGl2ZVNwbGF0UGF0aDogdHJ1ZSxcclxuICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxyXG4gICAgICAgIHYzX2xhenlSb3V0ZURpc2NvdmVyeTogdHJ1ZSxcclxuICAgICAgICB2M19zaW5nbGVGZXRjaDogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgLy8gcm91dGVzKGRlZmluZVJvdXRlcykge1xyXG4gICAgICAvLyAgIHJldHVybiBkZWZpbmVSb3V0ZXMoKHJvdXRlKSA9PiB7XHJcbiAgICAgIC8vICAgICByb3V0ZShcclxuICAgICAgLy8gICAgICAgXCJkYXNoYm9hcmRcIixcclxuICAgICAgLy8gICAgICAgXCJyb3V0ZXMvX3RlbXBsYXRlZGFzaGJvYXJkLmRhc2hib2FyZC9kYXNoYm9hcmQvRGFzaGJvYXJkLnRzeFwiXHJcbiAgICAgIC8vICAgICApLFxyXG4gICAgICAvLyAgICAgICAvLyBEYXNoYm9hcmQgaW5kZXggcm91dGVcclxuICAgICAgLy8gICAgICAgcm91dGUoXHJcbiAgICAgIC8vICAgICAgICAgXCJkYXNoYm9hcmQvam9ic1wiLFxyXG4gICAgICAvLyAgICAgICAgIFwicm91dGVzL190ZW1wbGF0ZWRhc2hib2FyZC5kYXNoYm9hcmQvam9icy9Kb2JzTGlzdC50c3hcIlxyXG4gICAgICAvLyAgICAgICApO1xyXG5cclxuICAgICAgLy8gICAgIHJvdXRlKFxyXG4gICAgICAvLyAgICAgICBcImRhc2hib2FyZC9qb2JzOmpvYklkXCIsXHJcbiAgICAgIC8vICAgICAgIFwicm91dGVzL190ZW1wbGF0ZWRhc2hib2FyZC5kYXNoYm9hcmQvam9icy9Kb2JEZXRhaWxzLnRzeFwiXHJcbiAgICAgIC8vICAgICApO1xyXG4gICAgICAvLyAgICAgcm91dGUoXHJcbiAgICAgIC8vICAgICAgIFwiZGFzaGJvYXJkL2pvYnMvbmV3XCIsXHJcbiAgICAgIC8vICAgICAgIFwicm91dGVzL190ZW1wbGF0ZWRhc2hib2FyZC5kYXNoYm9hcmQvam9icy9OZXdKb2IudHN4XCJcclxuICAgICAgLy8gICAgICk7XHJcbiAgICAgIC8vICAgfSk7XHJcbiAgICAgIC8vIH0sXHJcbiAgICB9KSxcclxuICAgIHRzY29uZmlnUGF0aHMoeyByb290OiAnLi4vLi4nIH0pLFxyXG4gIF0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgZXh0ZXJuYWw6IFsncG9zdGdyZXMnXSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBzc3I6IHtcclxuICAgIG5vRXh0ZXJuYWw6IFsvQG1hd2FoZWJcXC9kYi9dLFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0BtYXdhaGViL2RiJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy9kYi9zcmMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICAvLyBzZXJ2ZXI6IHtcclxuICAvLyAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxyXG4gIC8vICAgcG9ydDogMzAwMCxcclxuICAvLyB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2WixTQUFTLGNBQWMsYUFBYTtBQUNqYyxTQUFTLHNCQUFzQjtBQUMvQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLG1CQUFtQjtBQUMxQixTQUFTLGVBQWU7QUFKeEIsSUFBTSxtQ0FBbUM7QUFjekMsZUFBZSxFQUFFLGFBQWEsS0FBSyxDQUFDO0FBRXBDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxXQUFXO0FBQUEsSUFDckIsU0FBUyxDQUFDLFlBQVksTUFBTSxhQUFhLFFBQVE7QUFBQSxFQUNuRDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osUUFBUTtBQUFBLFFBQ04sbUJBQW1CO0FBQUEsUUFDbkIsc0JBQXNCO0FBQUEsUUFDdEIscUJBQXFCO0FBQUEsUUFDckIsdUJBQXVCO0FBQUEsUUFDdkIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQXVCRixDQUFDO0FBQUEsSUFDRCxjQUFjLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFBQSxFQUNqQztBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLFVBQVU7QUFBQSxJQUN2QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILFlBQVksQ0FBQyxjQUFjO0FBQUEsRUFDN0I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLGVBQWUsUUFBUSxrQ0FBVyx1QkFBdUI7QUFBQSxJQUMzRDtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
