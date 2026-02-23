/** @type {import('next').NextConfig} */
const nextConfig = {
    images: { unoptimized: true },
    async redirects() {
        return [
            {
                source: "/:path*",
                has: [{ type: "host", value: "vantonline.com" }],
                destination: "https://www.vantonline.com/:path*",
                permanent: true,
            },
        ];
    },
};
module.exports = nextConfig;
