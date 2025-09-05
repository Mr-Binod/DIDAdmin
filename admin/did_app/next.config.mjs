/** @type {import('next').NextConfig} */



const nextConfig = {
    devIndicators: false,
    output: "export",
    images: {
        unoptimized: true,
    },
    reactStrictMode: true
};

export default nextConfig;
