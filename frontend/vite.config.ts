import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          // Docker publishes Nginx on port 80; it forwards /api to FastAPI.
          target: env.API_PROXY_TARGET || "http://127.0.0.1:80",
          changeOrigin: true,
        },
      },
    },
  };
});
