import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ]
  },
  serverExternalPackages: ['kokoro-js', '@huggingface/transformers', 'onnxruntime-node'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), 'kokoro-js']
    } else {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        'onnxruntime-node': false,
      }
    }
    return config
  },
  distDir: process.env.E2E_SERVER_MODE === 'development' ? '.next/e2e' : '.next',
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
}
