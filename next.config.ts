import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
