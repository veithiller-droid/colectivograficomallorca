import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? "/colectivograficomallorca" : "",
  },
  ...(isGitHubPages
    ? {
        output: "export",
        basePath: "/colectivograficomallorca",
        assetPrefix: "/colectivograficomallorca/",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
