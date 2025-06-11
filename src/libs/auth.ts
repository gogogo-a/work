// Third-party Imports
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// Define custom user type
type CustomUser = {
  id: string
  email: string
  token: string
}

export const authOptions: NextAuthOptions = {
  // Remove Prisma adapter since we're using custom JWT auth
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        try {
          const { account_email, token } = credentials as { account_email: string; token: string }

          // If we have a token, consider it as a successful auth
          if (token) {
            // 确保 token 格式正确
            const finalToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`
            
            return {
              id: '1',
              email: account_email,
              token: finalToken
            } as CustomUser
          }

          return null
        } catch (e: any) {
          throw new Error(e.message)
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser
        token.email = customUser.email
        token.accessToken = customUser.token
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
        // @ts-ignore
        session.accessToken = token.accessToken
        // 将 token 也保存到 localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token.accessToken as string)
        }
      }
      return session
    }
  }
}
