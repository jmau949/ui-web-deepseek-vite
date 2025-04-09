import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({ mode }) => {
  // Load .env.local
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      sentryVitePlugin({
        // Your Sentry organization name (found in Sentry dashboard URL)
        org: "jonathan-mau",

        // Your Sentry project name (found in Sentry dashboard)
        project: "ui-web-deepseek", // REPLACEME

        // Auth token from Sentry (create in User Settings > API Keys)
        // Best practice: Use environment variables instead of hardcoding
        authToken: env.VITE_SENTRY_AUTH_TOKEN,

        // Enable source map uploading only in production builds
        // include: './dist',

        // Don't upload the actual source files, only source maps
        sourcemaps: {
          assets: "./dist/**",
          ignore: ["node_modules"],
        },

        // Set to false in CI environments where you don't want builds to fail if Sentry upload fails
        telemetry: true,

        // Enable debug logging for troubleshooting
        debug: false,
      }),
    ],
    // This ensures that source maps are generated in production builds
    build: {
      sourcemap: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});