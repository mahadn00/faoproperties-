import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Project photos are stored at most 2,560 px on the long side (see
    // scripts/optimize-images.mjs), so there's no point offering 3840.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
    // Resized photos are cached for 31 days instead of 4 hours, so the server
    // re-encodes them far less often. Replacing a photo under the same file
    // name keeps serving the old version until then — give it a new name.
    // (WebP only, the default: AVIF would encode ~50% slower and double the
    // image cache on disk for ~20% smaller files.)
    minimumCacheTTL: 2678400,
  },
  experimental: {
    // app/global-not-found.tsx handles URLs that match no route; there's no
    // single root layout to build a 404 from (one per language + admin).
    globalNotFound: true,
  },

  // The public site is one route tree, app/[locale]. English keeps its
  // unprefixed URLs: they're rewritten to /en internally, and anyone who
  // lands on /en/… is sent back to the canonical unprefixed address.
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
      // There's no /admin page itself; the leads page sends visitors who
      // aren't signed in on to /admin/login.
      { source: "/admin", destination: "/admin/leads", permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      // afterFiles: checked after public files (so /projects/<slug>/gallery/…
      // images are untouched) but before dynamic routes like [locale].
      afterFiles: [
        { source: "/", destination: "/en" },
        { source: "/projects/:slug", destination: "/en/projects/:slug" },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
