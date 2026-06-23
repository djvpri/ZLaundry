import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'
import { prisma } from './prisma'

const CROSS_APP_SECRET = new TextEncoder().encode(
  process.env.CROSS_APP_SECRET || 'z-ecosystem-admin-2026'
)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        ssoToken: { label: 'SSO Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null

        // SSO login dari Z One
        if (credentials.ssoToken) {
          try {
            const { payload } = await jwtVerify(credentials.ssoToken, CROSS_APP_SECRET)
            if (payload.app !== 'zlaundry') return null
            const email = String(payload.email || '')
            const user = await prisma.user.findUnique({ where: { email } })
            if (!user || user.isActive === false) return null
            return { id: user.id, name: user.name, email: user.email, role: user.role }
          } catch { return null }
        }

        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null

        // Face login
        if (credentials.password.startsWith('face:')) {
          return { id: user.id, name: user.name, email: user.email, role: user.role }
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
}
