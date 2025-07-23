import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    //TODO: (optional) remove unsplash
    domains: ["res.cloudinary.com", "images.unsplash.com"],
  },
};

export default nextConfig;
