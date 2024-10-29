import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  webpackDevMiddleware: (config: Configuration) => {
    config.watchOptions = {
      poll: 1000, // Check for changes every second
      aggregateTimeout: 300, // Delay before rebuilding
    };
    return config;
  },
};

export default nextConfig;
