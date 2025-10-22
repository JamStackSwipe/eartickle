// pages/api/auth/[...nextauth].js – NextAuth setup with Neon adapter
import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: {
    // Custom Neon adapter (upsert users on signin)
    async createUser(user) {
      const { rows } = await sql`INSERT INTO profiles (id, email, display_name) VALUES (${user.id}, ${user.email}, ${user.name}) RETURNING *;`;
      return rows[0];
    },
    async getUser(id) {
      const { rows } = await sql`SELECT * FROM profiles WHERE id = ${id};`;
      return rows[0] || null;
    },
    // Add other adapter methods as needed (linkAccount, createSession, etc.)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
