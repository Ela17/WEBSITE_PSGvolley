import type { NextConfig } from "next";

if (process.env.ADMIN_PASSWORD_HASH_BASE64) {
  const decoded = Buffer.from(
    process.env.ADMIN_PASSWORD_HASH_BASE64,
    "base64"
  ).toString("utf-8");
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
