import 'server-only'

import { betterAuth } from 'better-auth/minimal'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { authConfig } from '@/config/auth'
import { siteConfig } from '@/config/site'
import { prisma } from '@/server/database/client'
import { env } from '@/server/env'
import { authRateLimitEnabled } from './rate-limit'
import { anonymous } from 'better-auth/plugins'
import { mergeAnonymousDesks } from '@/server/vocabulary/desk'

export const auth = betterAuth({
  appName: siteConfig.name,
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.APP_URL,
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  rateLimit: {
    enabled: authRateLimitEnabled(env.APP_ENV),
  },
  advanced: {
    cookiePrefix: siteConfig.slug,
    crossSubDomainCookies: {
      enabled: false,
    },
  },
  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        await mergeAnonymousDesks(anonymousUser.user.id, newUser.user.id)
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    // The template intentionally keeps auth self-contained: no external mail provider.
    requireEmailVerification: false,
    minPasswordLength: authConfig.minPasswordLength,
    maxPasswordLength: authConfig.maxPasswordLength,
  },
})
