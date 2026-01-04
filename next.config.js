// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Clickjacking対策
          { key: "X-Frame-Options", value: "DENY" },

          // MIME sniffing対策
          { key: "X-Content-Type-Options", value: "nosniff" },

          // リファラ情報の漏えい抑制
          { key: "Referrer-Policy", value: "same-origin" },

          // 不要なブラウザ権限を無効化
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;