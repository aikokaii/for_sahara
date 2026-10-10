import { defineConfig } from "vite";

const site = (process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "")).replace(/\/$/, "");

export default defineConfig({
  plugins: [{
    name: "absolute-og-image",
    transformIndexHtml: html => (site ? html.replaceAll('content="/og.png"', `content="${site}/og.png"`) : html),
  }],
});
