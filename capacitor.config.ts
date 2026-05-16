import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.zichru.app",
  appName: "Zichru",
  webDir: "out", // Next.js static export directory
  server: {
    // For development, use live reload from Next.js dev server
    // url: "http://localhost:3000",
    // cleartext: true,
  },
};

export default config;
