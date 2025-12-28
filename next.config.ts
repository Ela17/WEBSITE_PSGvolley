import type { NextConfig } from "next";

console.log("🔐 [next.config.ts] Verifica variabili:");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "✅" : "❌");
console.log("ADMIN_USERNAME:", process.env.ADMIN_USERNAME ? "✅" : "❌");
console.log("ADMIN_PASSWORD_HASH_BASE64:", process.env.ADMIN_PASSWORD_HASH_BASE64 ? "✅" : "❌");

if (process.env.ADMIN_PASSWORD_HASH_BASE64) {
  const decoded = Buffer.from(process.env.ADMIN_PASSWORD_HASH_BASE64, 'base64').toString('utf-8');
  console.log("Hash decodificato (primi 20 char):", decoded.substring(0, 20));
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "idulduagzuywrckdmqgy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;