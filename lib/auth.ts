import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import clientPromise from "./db";
import jwt from "jsonwebtoken";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is required");
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    // Force SIGNED JWTs instead of encrypted JWE
    encode: async ({ token, secret }) => {
      return jwt.sign(token as object, secret, { algorithm: "HS256" });
    },
    decode: async ({ token, secret }) => {
      return jwt.verify(token!, secret) as any;
    },
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection("users").findOne({
          email: credentials.email,
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        // Extend the session user with custom properties
        (session.user as any).id = token.id as string;
        (session.user as any).email = token.email as string;

        // Create JWT with id and email for Lambda
        (session.user as any).token = jwt.sign(
          {
            userId: token.id,
            email: token.email,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
          },
          process.env.NEXTAUTH_SECRET!,
          { algorithm: "HS256" }
        );
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};
