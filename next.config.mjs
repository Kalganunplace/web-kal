/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Supabase Auth 모듈 로딩 이슈 해결
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }

    // 더 관대한 파싱을 위한 설정
    if (config.module.parser) {
      config.module.parser = {
        ...config.module.parser,
        javascript: {
          ...config.module.parser?.javascript,
          strictExportPresence: false,
        }
      }
    }

    // 개발 모드에서 더 관대한 오류 처리
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
        chunkIds: 'named',
      }
    }

    // SVGR 설정
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config
  },
}

export default nextConfig
